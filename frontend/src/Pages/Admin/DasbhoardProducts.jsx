import { useCreateCouseHook, useGetAdminCoursesHook } from '@/hooks/course.hook'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

const DashboardProducts = () => {
  const { data } = useGetAdminCoursesHook()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset: resetForm } = useForm()
  const { mutate, isPending } = useCreateCouseHook()
  const [openModule, setOpenModule] = useState(false)

  const getCourseId = (id) => {
    navigate(`/dashboard/CourseModule/${id}`)
  }

  const createCourseHandler = (data) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('amount', data.amount)
    formData.append('thumbnail', data.thumbnail[0])

    mutate(formData, {
      onSuccess: (res) => {
        toast.success(res.message)
        setOpenModule(false)
        resetForm()
        // Refresh the admin's own course list
        queryClient.invalidateQueries(['getAdminCourses'])
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>

        <Dialog open={openModule} onOpenChange={setOpenModule}>
          <DialogTrigger
            disabled={isPending}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            + Add Course
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Course</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(createCourseHandler)}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Course Title</label>
                <input
                  {...register("title", { required: true })}
                  placeholder="e.g. MERN Stack Masterclass"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  {...register("description", { required: true })}
                  placeholder="Describe what students will learn..."
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹)</label>
                <input
                  type="number"
                  {...register("amount", { required: true, min: 0 })}
                  placeholder="e.g. 999"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("thumbnail", { required: true })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <button
                disabled={isPending}
                type="submit"
                className="w-full py-3 bg-emerald-600 flex items-center justify-center text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60 mt-2"
              >
                {isPending ? <Spinner /> : "✅ Create Course"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.courses?.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-16">
            You haven't created any courses yet. Click "+ Add Course" to get started.
          </p>
        )}
        {data?.courses?.map((item) => (
          <div
            key={item._id}
            onClick={() => getCourseId(item._id)}
            className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 group"
          >
            <div className="h-40 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-full object-contain group-hover:scale-105 transition"
              />
            </div>

            <div className="mt-4">
              <h2 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {item.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>

              <div className="mt-3 font-bold text-emerald-600">
                ₹ {item.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardProducts
