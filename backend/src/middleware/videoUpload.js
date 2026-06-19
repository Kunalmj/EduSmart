import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "courseModule",
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    }
})

export const videoUpload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) cb(null, true)
        else cb(new Error('Only video files are allowed!'), false)
    }
})