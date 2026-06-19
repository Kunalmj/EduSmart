import { GoogleGenerativeAI } from "@google/generative-ai";
import { Quiz } from "../models/quiz.model.js";
import { ENV } from "../config/env.js";
import { Questions } from "../models/question.model.js";
import { Modules } from "../models/module.model.js";

const genAi = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)
const model = genAi.getGenerativeModel({model:'gemini-2.0-flash'})

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
        if(!moduleDoc){
            return res.status(404).json({
                message:"Module not found"
            })
        }

        newQuiz = await Quiz.create({
            userId:req.user._id,
            moduleId
        })

        console.log(`[QuizGen] Generating quiz from content text...`);

        const prompt = `You are an expert quiz creator. Based on the following course module content, generate exactly 10 multiple-choice questions to test understanding.

Module Content:
"""
${content}
"""

Requirements:
- Each question must have exactly 4 options
- The correctOption must be one of the 4 options (exact match)
- Include a clear explanation for each correct answer
- Questions should test key concepts from the content

Return ONLY valid JSON in this exact format, no markdown, no extra text:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctOption": "string",
      "explanation": "string"
    }
  ]
}`;

        const result = await model.generateContent(prompt);

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
        return res.status(500).json({ message: error?.message || "Failed to generate quiz" });
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