import React, { useRef, useState } from 'react'
import { useUserStore } from '@/Store/user.store'
import { useUpdateProfileHook } from '@/hooks/User.hook'
import { useGetAllPurchaseCourse } from '@/hooks/course.hook'
import { Spinner } from '@/components/ui/spinner'
import { Camera, BookOpen, Mail, User, Shield, Edit2, Check, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const Profile = () => {
  const { user } = useUserStore()
  const { mutate, isPending } = useUpdateProfileHook()
  const { data: coursesData } = useGetAllPurchaseCourse()
  const fileInputRef = useRef(null)

  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreviewPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const formData = new FormData()
    formData.append('fullName', fullName)
    if (selectedFile) {
      formData.append('profilePhoto', selectedFile)
    }
    mutate(formData, {
      onSuccess: () => {
        setIsEditing(false)
        setPreviewPhoto(null)
        setSelectedFile(null)
      }
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFullName(user?.fullName || '')
    setPreviewPhoto(null)
    setSelectedFile(null)
  }

  const purchasedCount = coursesData?.purchasedCourse?.length || 0
  const avatarSrc = previewPhoto || user?.profilePhoto || ''

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-blue-400">
      <div className="h-48 relative overflow-hidden"></div>
      <div className="max-w-4xl mx-auto px-6 -mt-24 pb-16">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Avatar Section */}
          <div className="relative px-8 pt-6 pb-0">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-28 h-28 ring-4 ring-white shadow-xl">
                  <AvatarImage src={avatarSrc} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-3xl font-bold">
                    {user?.fullName?.slice(0, 2)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Name & Badge */}
              <div className="pb-4 flex-1">
                {isEditing ? (
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-500 bg-transparent focus:outline-none w-full max-w-xs"
                    placeholder="Your name"
                    autoFocus
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-slate-900">{user?.fullName}</h1>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {user?.admin && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                  <span className="text-sm text-slate-500">{user?.email}</span>
                </div>
              </div>

              {/* Edit/Save Controls */}
              <div className="pb-4 flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg disabled:opacity-60"
                    >
                      {isPending ? <Spinner /> : <><Check className="w-4 h-4" /> Save</>}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-sm font-medium transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 mx-8 mt-4"></div>

          {/* Stats */}
          <div className="px-8 py-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-2xl">
              <div className="text-3xl font-black text-indigo-600">{purchasedCount}</div>
              <p className="text-sm text-slate-600 font-medium mt-1">Enrolled Courses</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-2xl">
              <div className="text-3xl font-black text-emerald-600">
                {user?.admin ? '∞' : purchasedCount * 12}
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">Hours Learning</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-2xl">
              <div className="text-3xl font-black text-purple-600">
                {user?.admin ? 'Admin' : 'Learner'}
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">Role</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="px-8 py-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Full Name</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Enrolled Courses</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {purchasedCount} {purchasedCount === 1 ? 'course' : 'courses'}
                  </p>
                </div>
              </div>

              {user?.admin && (
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Account Type</p>
                    <p className="text-sm font-semibold text-amber-900">Administrator</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enrolled Courses Preview */}
          {purchasedCount > 0 && (
            <div className="px-8 py-6 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Enrolled Courses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coursesData.purchasedCourse.slice(0, 4).map((course) => (
                  <div key={course._id} className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Course' }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-emerald-600 font-medium mt-1">₹{course.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
