# EduSmart

A comprehensive Learning Management System (LMS) built with React, Node.js, and MongoDB. This platform allows educators to create and manage courses, while students can enroll in, learn from, and complete these courses with ease.

## Features

- **User Authentication**: Secure sign-up and login for both students and instructors.
- **Course Management**: 
  - Instructors can create, update, and delete courses.
  - Detailed course structure including lessons, quizzes, and assignments.
- **Student Learning**: 
  - Browse and search for courses.
  - Enroll in courses.
  - Track progress through course content.
- **Media Support**: Integrated video player for lessons.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience on all devices.

## Tech Stack

### Frontend
- **Framework**: React v19
- **Build Tool**: Vite v7
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt.js
- **Environment**:dotenv

## Project Structure

```
lms-website/
├── backend/         # Express.js API and server-side logic
│   ├── models/      # Mongoose schemas (User, Course, etc.)
│   ├── routes/      # API routes definition
│   ├── server.js    # Express server entry point
│   └── ...
└── frontend/        # React application
    ├── src/
    │   ├── components/  # Reusable React components
    │   ├── contexts/    # React Context for state management
    │   ├── pages/       # Full page components
    │   ├── services/    # API interaction logic
    │   └── ...
    ├── index.html
    └── vite.config.js
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) installed and running, or access to MongoDB Atlas

## Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Usage

### Development
- The backend runs on `http://localhost:5000`.
- The frontend runs on `http://localhost:5173`.
- All API requests from the frontend are automatically proxied to the backend.

### Building for Production
To create a production build of the frontend:
```bash
cd frontend
npm run build
```
