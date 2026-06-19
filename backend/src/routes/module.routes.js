import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { createModule, getComment, getSingleCourseModule } from "../controllers/module.controller.js";
import { videoUpload } from "../middleware/videoUpload.js";

const moduleRoute = express.Router()

// Wrap multer with proper error handling so errors return JSON
moduleRoute.post('/createModule', protectRoute, adminRoute, (req, res, next) => {
    videoUpload.single('video')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err)
            return res.status(400).json({ message: err.message })
        }
        next()
    })
}, createModule)

moduleRoute.get('/getModule/:id', protectRoute, getSingleCourseModule)
moduleRoute.get('/comment/:id', protectRoute, getComment)

export default moduleRoute