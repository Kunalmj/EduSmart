import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.js'
import { createCourse, getAllPurchasedCourse, getCourse, getPurchasedCourse, getSingleCourse, getAdminCourses } from '../controllers/course.controller.js'


const courseRoute = express.Router()


courseRoute.post('/createCourse', protectRoute, adminRoute, upload.single("thumbnail"), createCourse)

courseRoute.get('/getCourse', protectRoute, getCourse)
courseRoute.get('/getSingleCourse/:id', protectRoute, getSingleCourse)

courseRoute.get('/purchasedCourse/:id', protectRoute, getPurchasedCourse)

courseRoute.get('/getAllCoursePurchase', protectRoute, getAllPurchasedCourse)

// Admin-scoped: only the logged-in admin's own courses
courseRoute.get('/getAdminCourses', protectRoute, adminRoute, getAdminCourses)


export default courseRoute