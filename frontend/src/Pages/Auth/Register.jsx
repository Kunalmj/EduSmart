import { Spinner } from '@/components/ui/spinner'
import { useRegisterHook } from '@/hooks/User.hook'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, GraduationCap, BookOpen } from 'lucide-react'

const Register = () => {
  const { register, handleSubmit } = useForm()
  const { mutate, isPending } = useRegisterHook()
  const [role, setRole] = useState('student')

  const registerFormHandler = (data) => {
    mutate({ ...data, role })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join EduSmart and start your journey
          </p>
        </div>

        {/* Role Toggle */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">I want to join as</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                role === 'student'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className={`w-6 h-6 ${role === 'student' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className="text-center">
                <p className="font-semibold text-sm">Student</p>
                <p className="text-xs text-gray-500 mt-0.5">Learn & grow</p>
              </div>
              {role === 'student' && (
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                role === 'teacher'
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <BookOpen className={`w-6 h-6 ${role === 'teacher' ? 'text-purple-600' : 'text-gray-400'}`} />
              <div className="text-center">
                <p className="font-semibold text-sm">Teacher</p>
                <p className="text-xs text-gray-500 mt-0.5">Teach & create</p>
              </div>
              {role === 'teacher' && (
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              )}
            </button>
          </div>

          {role === 'teacher' && (
            <div className="mt-3 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-xs text-purple-700 font-medium text-center">
                🎓 You'll get access to the <strong>Teacher Dashboard</strong> to create & manage courses
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(registerFormHandler)}
          className="space-y-4"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="John Doe"
                {...register('fullName', { required: true })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: true })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: true })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-60 flex items-center justify-center mt-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              role === 'teacher'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isPending ? <Spinner /> : `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Account`}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
