/**
 * Seed script to add sample courses to EduSmart LMS
 * Run with: node seed.js
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

// Connect DB
await mongoose.connect(process.env.MONGO_URI)
console.log('✅ Connected to MongoDB')

// User model
const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    admin: { type: Boolean, default: false },
    purchasedCourse: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    profilePhoto: String
}, { timestamps: true })
const User = mongoose.models.User || mongoose.model('User', userSchema)

// Course model
const courseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    thumbnail: String,
    amount: Number,
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Modules' }]
}, { timestamps: true })
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)

// Find teacher/admin user
const teacher = await User.findOne({ admin: true })
if (!teacher) {
    console.log('❌ No admin/teacher found. Register as teacher first.')
    process.exit(1)
}
console.log(`👤 Using teacher: ${teacher.fullName} (${teacher.email})`)

// Sample courses
const sampleCourses = [
    {
        userId: teacher._id,
        title: 'MERN Stack Development Masterclass',
        description: 'Master the complete MERN Stack — MongoDB, Express.js, React, and Node.js. Build real-world full-stack web applications from scratch. Includes REST APIs, authentication, deployment, and more.',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80',
        amount: 999
    },
    {
        userId: teacher._id,
        title: 'Python for Data Science & AI',
        description: 'Learn Python programming with a focus on data science, machine learning, and AI. Covers NumPy, Pandas, Matplotlib, Scikit-learn, and TensorFlow with hands-on projects.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
        amount: 1299
    },
    {
        userId: teacher._id,
        title: 'DevOps & Cloud Engineering with AWS',
        description: 'Comprehensive DevOps course covering Docker, Kubernetes, CI/CD pipelines, Terraform, and AWS services. Deploy and manage scalable cloud infrastructure.',
        thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&q=80',
        amount: 1499
    },
    {
        userId: teacher._id,
        title: 'React Native — Mobile App Development',
        description: 'Build cross-platform mobile apps for iOS and Android using React Native. Covers navigation, state management, API integration, and publishing to app stores.',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
        amount: 799
    },
    {
        userId: teacher._id,
        title: 'Advanced JavaScript & TypeScript',
        description: 'Deep dive into modern JavaScript ES6+, TypeScript, async programming, design patterns, and performance optimization. The essential course for senior developers.',
        thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80',
        amount: 699
    },
    {
        userId: teacher._id,
        title: 'UI/UX Design with Figma',
        description: 'Learn professional UI/UX design using Figma. Covers wireframing, prototyping, design systems, user research, and creating stunning interfaces for web and mobile.',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
        amount: 599
    }
]

// Check existing courses
const existingCount = await Course.countDocuments()
console.log(`📚 Found ${existingCount} existing courses`)

if (existingCount >= sampleCourses.length) {
    console.log('✅ Courses already seeded! Exiting.')
    await mongoose.disconnect()
    process.exit(0)
}

// Insert courses
for (const courseData of sampleCourses) {
    const existing = await Course.findOne({ title: courseData.title })
    if (existing) {
        console.log(`⏭️  Skipping existing: ${courseData.title}`)
        continue
    }
    const course = await Course.create(courseData)
    console.log(`✅ Created course: ${course.title} (₹${course.amount})`)
}

console.log('\n🎉 Seeding complete!')
await mongoose.disconnect()
process.exit(0)
