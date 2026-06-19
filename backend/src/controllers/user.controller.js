import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ENV } from "../config/env.js";
import cloudinary from "../config/cloudinary.js";



export const Register = async(req ,res)=>{
    try {
        const {fullName, email, password, role} = req.body;

        if(!fullName || !email || !password){
            return res.status(401).json({
                message:"Please provide all the details", 
                success:false
            })
        }

        const user = await User.findOne({email})
        if(user){
            return res.status(401).json({
                message:"User already exist"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const isTeacher = role === 'teacher'

        const newUser = await User.create({
            fullName,
            email,
            password:hashedPassword,
            admin: isTeacher || email === ENV.ADMIN
        })

        const token = jwt.sign({userId:newUser._id}, ENV.JWT_SECRET, {expiresIn:'7d'})

        const cookieOptions = {maxAge:7*24*60*60*1000, httpOnly:true, secure:true, sameSite:"none"}

        if(newUser.admin){
            return res.status(201).cookie("token", token, cookieOptions).json({
                message:`Welcome, Teacher ${newUser.fullName}! Your dashboard is ready.`,
            })
        }

        return res.status(201).cookie("token", token, cookieOptions).json({
                message:`Welcome ${newUser.fullName}! Start exploring courses.`
            })


    } catch (error) {
        console.log(`error from register backend, ${error}`)
        res.status(500).json({message: 'Registration failed'})
    }
}


export const Login = async(req,res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(401).json({
                messsage:"Please provide all the details"
            })
        }

        const user = await User.findOne({email})

        if(!user){
            return res.status(401).json({
                message:"Erorr in email or password"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
             return res.status(401).json({
                message:"Erorr in email or password"
            })
        }

        if(user.email == ENV.ADMIN){
            user.admin = true,
            await user.save()
        }

        const token = jwt.sign({userId:user._id}, ENV.JWT_SECRET, {expiresIn:'7d'})

        res.cookie("token", token, {
            maxAge: 7*24*60*60*1000,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })

        if(user.admin){
            return res.status(201).json({
                message:"Welcome back admin"
            })
        }


        return res.status(201).json({
            message:`Welcome ${user.fullName}`
        })


        
    } catch (error) {
        console.log(`error from Login backend, ${error}`)
    }
}


export const getUser = async(req,res)=>{
    try {
        const userId = req.user._id

        const user = await User.findById(userId)

        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }


        return res.status(201).json(user)
    } catch (error) {
        console.log(`error from get User, ${error}`)
    }
}


export const logout=async(req,res)=>{
    try {
        return res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(201).json({
            message:"User logged out"
        })
    } catch (error) {
        console.log(error)
    }
}



export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName } = req.body;
        
        const updateData = {};
        
        if (fullName) {
            updateData.fullName = fullName;
        }
        
        // Safe file check
        if (req.file) {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            
            const uploadRes = await cloudinary.uploader.upload(base64, {
                folder: "profilePhoto",
            });
            
            updateData.profilePhoto = uploadRes.secure_url;
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });
        
    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
