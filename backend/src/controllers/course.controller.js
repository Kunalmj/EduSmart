import cloudinary from "../config/cloudinary.js";
import { ENV } from "../config/env.js";
import { Course } from "../models/course.model.js";
import { GoogleGenerativeAI } from '@google/generative-ai'
import { User } from "../models/user.model.js"; 
import {Modules} from '../models/module.model.js'
const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({model:'gemini-2.5-flash'})

export const createCourse =async(req , res)=>{
    try {
        const {title, description, amount} = req.body;
        const thumbnail = req.file

        if(!title || !description || !amount){
            return res.status(401).json({
                message:"Please provide all the detail"
            })
        }

        let imageUrl =""
        
        const base64 = `data:${req.file.mimetype};base64,${thumbnail.buffer.toString("base64")}`;

        const uploadRes = await cloudinary.uploader.upload(base64,{
            folder:"lmsYT"
        })

        imageUrl = uploadRes.secure_url

        const newCourse = await Course.create({
            userId:req.user._id,
            title,
            description,
            thumbnail:imageUrl,
            amount
        })

        return res.status(201).json({
            message:"Course Created Successfully",
            newCourse
        })

    } catch (error) {
        console.log(`error from create course. ${error}`)
    }
}



// Admin: get only THIS admin's courses
export const getAdminCourses = async(req, res)=>{
    try {
        const userId = req.user._id;
        const courses = await Course.find({ userId }).lean();
        return res.status(200).json({ courses });
    } catch (error) {
        console.log(`error from getAdminCourses, ${error}`);
        return res.status(500).json({ message: "Failed to fetch courses" });
    }
}

export const getCourse = async(req, res)=>{
    try {
        const {search}  = req.query;

        if(!search || search.trim() === ""){
            const allCourses = await Course.find()

            return res.status(200).json({
                courses:allCourses
            })
        }

        let aiText = "";
        try {
            const prompt =`You are an intelligent assistant for a learning managemenge platform System . A user is searching for courses. analyze the query and return the most relevant keyword from these categories
            
            -Artificial intelligence,
            -MERN Stack,
            -DevOps,
            -Mobile Development

            only reply with one keyword that best matches the query no explanation

            user query: ${search}
            `;

            const result = await model.generateContent(prompt);

            aiText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text
            ?.trim()
            .replace(/[`"\n]/g, "") || "";

            console.log("search ", search)
            console.log("Ai text", aiText)
        } catch (aiError) {
            console.error("Gemini API course search categorization failed:", aiError.message);
        }

        const searchConditions = [
            {title:{$regex:search, $options:"i"}},
            {description:{$regex:search, $options:"i"}},
        ];

        if (aiText && aiText.toLowerCase() !== search.toLowerCase()) {
            searchConditions.push(
                {title:{$regex:aiText, $options:"i"}},
                {description:{$regex:aiText, $options:"i"}},
            );
        }

        const mongoQuery = {
            $or: searchConditions
        };

        const courses = await Course.find(mongoQuery).lean()

        console.log(`found ,${courses.length} , courses for query: ${search} (AI term: ${aiText || 'none'})`)

        return res.status(200).json({
            success:true,
            courses,
            count:courses.length,
            searchTerm:search,
        })

    } catch (error) {
        console.error(`error from getCourse, ${error}`)
        return res.status(500).json({
            success: false,
            message: "Internal server error during search",
            error: error.message
        });
    }
}



export const getSingleCourse=async(req,res)=>{
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId).populate("modules")


        if(!course){
            return res.status(401).json({
                message:"Course not found"
            })
        }


        return res.status(201).json(course)
    } catch (error) {
        console.log(error ," from get single course")
    }
}


// user ne 4 course purchase kiye 
// lekin ab user jo hai woh kisi ek course se padhna chahta hai 
// toh user kisi ek course koi padhen k liye selecte karega toh uske liye humne getpurchase course ka controller create kiye hai yeh apko ek single course provide karega from purchased course

export const getPurchasedCourse = async(req,res)=>{
    try {
        const courseId = req.params.id;

        if(!courseId){
            return res.status(401).json({
                message:"course not found"
            })
        }

        const purchasedOrder = await Course.findById(courseId).populate({
            path: "modules",
            populate: { path: "quiz" }
        })


        if(!purchasedOrder){
            return res.status(401).json({
                message:"Course not found"
            })
        }


        return res.status(201).json(purchasedOrder)
    } catch (error) {
        console.log(error, "from getPurchased course")
    }
}


export const getAllPurchasedCourse = async(req,res)=>{
    try {
        const userId = req.user._id

        const user = await User.findById(userId).populate("purchasedCourse")

        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }

        return res.status(201).json(user)
    } catch (error) {
        console.log(error)
    }
}