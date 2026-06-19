import express from 'express'
import { connectDB } from './src/config/db.js'
import { ENV } from './src/config/env.js'
import cookieParser from 'cookie-parser'
import userRoute from './src/routes/user.route.js'
import courseRoute from './src/routes/course.route.js'
import moduleRoute from './src/routes/module.routes.js'
import quizRoute from './src/routes/quiz.route.js'
import commentRoute from './src/routes/comment.route.js'
import paymentRoute from './src/routes/payment.route.js'
import analyticRoute from './src/routes/analytic.route.js'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const clientUrl = ENV.CLIENT_URL ? ENV.CLIENT_URL.replace(/\/$/, "") : "";

app.use(cors({
    origin: [clientUrl, "http://localhost:5173"],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded videos as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
    res.json({ message: "EduSmart API is running successfully!" })
})

app.use('/api', userRoute)
app.use('/api/course', courseRoute)
app.use('/api/module', moduleRoute)
app.use('/api/quiz', quizRoute)
app.use('/api/comment', commentRoute)
app.use('/api/payment', paymentRoute)
app.use('/api/analytic', analyticRoute)


let server;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server = app.listen(ENV.PORT, () => {
        console.log("server started on port", ENV.PORT)
        connectDB()
    })
    // 10 minute timeout for large video uploads
    server.timeout = 10 * 60 * 1000
} else {
    connectDB()
}

export default app