import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { Quiz } from "../models/quiz.model.js";
import { ENV } from "../config/env.js";
import { Questions } from "../models/question.model.js";
import { Modules } from "../models/module.model.js";
import fs from "fs";
import path from "path";

const genAi = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)
const model = genAi.getGenerativeModel({model:'gemini-1.5-flash'})
const fileManager = new GoogleAIFileManager(ENV.GEMINI_API_KEY)

export const checkQuiz = async(req,res)=>{
    try {
        const moduleId = req.params.id;

        const quiz = await Quiz.findOne({
            userId:req.user._id,
            moduleId
        })

        return res.status(201).json({
            success:true,
            hasQuiz: quiz,
            quiz: quiz|| null

        })
    } catch (error) {
        console.log(error , "from check quiz")
        return res.status(500).json({ message: "Server error checking quiz" })
    }
}


export const generateQuiz = async(req, res)=>{
    let tempFilePath = null;
    let uploadResult = null;
    let newQuiz = null;
    try {
        const {moduleId, content} = req.body;
        if(!moduleId || !content){
            return res.status(401).json({
                message:"Something is missing"
            })
        }

        const existingQuiz = await Quiz.findOne({
            userId:req.user._id,
            moduleId
        })

        if(existingQuiz && existingQuiz.questions.length>0){
            return res.status(201).json({
                message:"You already generated quiz for this module"
            })
        }

        // Fetch module to validate it exists
        const moduleDoc = await Modules.findById(moduleId);
        if(!moduleDoc || !moduleDoc.video){
            return res.status(404).json({
                message:"Module or video not found"
            })
        }

        newQuiz = await Quiz.create({
            userId:req.user._id,
            moduleId
        })

        console.log(`[QuizGen] Downloading video from: ${moduleDoc.video}`);
        // Download video to local temp file
        tempFilePath = path.join(process.cwd(), `temp-video-${Date.now()}-${Math.floor(Math.random() * 1000)}.mp4`);
        const response = await fetch(moduleDoc.video);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(tempFilePath, buffer);

        console.log(`[QuizGen] Uploading video to Gemini File API...`);
        // Upload to Gemini
        uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: "video/mp4",
            displayName: moduleDoc.title || "Module Video",
        });

        let file = uploadResult.file;
        console.log(`[QuizGen] File uploaded. URI: ${file.uri}. State: ${file.state}`);

        // Poll for ACTIVE state
        while (file.state === FileState.PROCESSING) {
            console.log(`[QuizGen] Video is processing... checking again in 5 seconds`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            file = await fileManager.getFile(file.name);
        }

        if (file.state !== FileState.ACTIVE) {
            throw new Error(`Gemini video processing failed with state: ${file.state}`);
        }

        console.log(`[QuizGen] Video is ACTIVE. Generating quiz from video...`);

        const prompt = `Generate 10 technical questions based on this video. Each Question should be multiple choice with 4 options. Return the response in this JSON format, no additional text:
        {
        "questions":[
        {
        "question":"string",
        "options":["string", "string", "string", "string"],
        "correctOption":"string",
        "explanation":"string"
        }
        ]
        }`;

        const result = await model.generateContent([
            {
                fileData: {
                    fileUri: file.uri,
                    mimeType: file.mimeType,
                },
            },
            prompt
        ]);

        const text = result.response.text();
        const cleanText = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        let parsed;

        try {
            parsed = JSON.parse(cleanText);
        } catch (error) {
            console.log("failed to parse gemini response:", cleanText.slice(0, 200));
            await Quiz.findByIdAndDelete(newQuiz._id);
            return res.status(500).json({message:"Quiz cannot be generated due to parsing failure"});
        }

        const generateQuestion = parsed.questions || [];

        if(!Array.isArray(generateQuestion) || generateQuestion.length===0){
            await Quiz.findByIdAndDelete(newQuiz._id);
            return res.status(500).json({message:"No questions generated"});
        }

        const createdQuestion = [];

        for(const q of generateQuestion){
            const doc = await Questions.create({
                quizId:newQuiz._id,
                content:q.question,
                options:q.options,
                correctOption:q.correctOption,
                explanation:q.explanation
            });

            createdQuestion.push(doc);
        }

        const ids = createdQuestion.map((q)=>q._id);

        await Quiz.findByIdAndUpdate(
            newQuiz._id, 
            {$push:{questions:{$each:ids}}},
            {new:true}
        );

        await Modules.findByIdAndUpdate(
            moduleId,
            {quiz:newQuiz._id},
            {new:true}
        );

        console.log(`[QuizGen] Quiz generated successfully with ${ids.length} questions!`);

        return res.status(201).json({
            message:"Quiz generated"
        });
    } catch (error) {
        console.log(error, "error from generateQuiz");
        if (newQuiz && newQuiz._id) {
            try {
                await Quiz.findByIdAndDelete(newQuiz._id);
            } catch (cleanupErr) {
                console.error("Failed to delete empty quiz after failure:", cleanupErr);
            }
        }
        // Handle quota exceeded errors with a friendly message
        const errMsg = error?.message || '';
        if (errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED') || error?.status === 429) {
            return res.status(429).json({
                message: "AI quota exceeded. Please try again after some time (quota resets daily)."
            });
        }
        return res.status(500).json({ message: errMsg || "Failed to generate quiz" });
    } finally {
        // Local file cleanup
        if (tempFilePath) {
            try {
                if (fs.existsSync(tempFilePath)) {
                    await fs.promises.unlink(tempFilePath);
                    console.log(`[QuizGen] Deleted local temp file: ${tempFilePath}`);
                }
            } catch (err) {
                console.error("[QuizGen] Failed to delete local temp file:", err);
            }
        }
        // Gemini File API cleanup
        if (uploadResult && uploadResult.file) {
            try {
                await fileManager.deleteFile(uploadResult.file.name);
                console.log(`[QuizGen] Deleted file from Gemini File API: ${uploadResult.file.name}`);
            } catch (err) {
                console.error("[QuizGen] Failed to delete file from Gemini File API:", err);
            }
        }
    }
}



export const getQuiz = async(req,res)=>{
    try {
        const quizId = req.params.id;
        
        if(!quizId){
            return res.status(401).json({
                message:"quiz id not found"
            })
        }

        const quiz = await Quiz.findOne({
            _id:quizId,
            userId:req.user._id
        }).populate("questions")

        if(!quiz){
            return res.status(401).json({
                message:"Quiz not found"
            })
        }

        return res.status(201).json({
            success:true,
            quiz
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error fetching quiz" })
    }
}