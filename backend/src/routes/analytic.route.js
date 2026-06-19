import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js'
import { getAnalyticsDataController, getDailyAnalytcController, getAdminAnalyticsController, getAdminDailyAnalyticsController } from '../controllers/analytic.controller.js'


const analyticRoute = express.Router()


analyticRoute.get('/getAnalytic', protectRoute, adminRoute, getAnalyticsDataController)
analyticRoute.get('/getDailyData', protectRoute, adminRoute, getDailyAnalytcController)

// Admin-scoped analytics (per-admin dashboard)
analyticRoute.get('/getAdminAnalytic', protectRoute, adminRoute, getAdminAnalyticsController)
analyticRoute.get('/getAdminDailyData', protectRoute, adminRoute, getAdminDailyAnalyticsController)


export default analyticRoute