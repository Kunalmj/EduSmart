import { useGetSingleCourseHook } from '@/hooks/course.hook'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { createModuleApi } from '@/Api/module.api'
import { toast } from 'sonner'
import { Upload, Video, CheckCircle, BookOpen } from 'lucide-react'

const CreateModule = () => {
  const { id } = useParams()
  const { data, refetch } = useGetSingleCourseHook(id)
  const [openModule, setOpenModule] = useState(false)
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, watch } = useForm()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const selectedFile = watch('video')
  const videoFile = selectedFile?.[0]

  const moduleFormHandler = async (formData) => {
    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    const data = new FormData()
    data.append('title', formData.title)
    data.append('video', videoFile)
    data.append('courseId', id)

    try {
      setIsUploading(true)
      setUploadProgress(0)

      await createModuleApi(data, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percent)
      })

      toast.success('Module created successfully!')
      setOpenModule(false)
      reset()
      setUploadProgress(0)
      queryClient.invalidateQueries(['getSingleCourse', id])
      refetch()
    } catch (err) {
      console.error('Full upload error:', err?.response || err)
      const msg = err?.response?.data?.message || err?.message || 'Upload failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      {/* Course Header */}
      <div className='mb-10'>
        <div className='flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2'>
          <BookOpen className='w-4 h-4' />
          <span>Course Management</span>
        </div>
        <h1 className='text-3xl font-black text-slate-900 mb-2'>{data?.title}</h1>
        <div className='flex items-center gap-4 text-sm text-slate-500'>
          <span>{data?.modules?.length || 0} modules</span>
          <span>•</span>
          <span>{data?.description?.slice(0, 60)}...</span>
        </div>
      </div>

      {/* Create Module Button */}
      <Dialog open={openModule} onOpenChange={(open) => {
        if (!isUploading) {
          setOpenModule(open)
          if (!open) { reset(); setUploadProgress(0) }
        }
      }}>
        <DialogTrigger className='inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
          </svg>
          Add New Module
        </DialogTrigger>

        <DialogContent className='max-w-md' onInteractOutside={(e) => isUploading && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold flex items-center gap-2'>
              <Video className='w-5 h-5 text-emerald-600' />
              New Module
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(moduleFormHandler)} className='space-y-5 mt-2'>
            {/* Title */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>Module Title</label>
              <input
                type="text"
                placeholder='e.g. Introduction to React Hooks'
                className='w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all text-sm'
                {...register('title', { required: true })}
                disabled={isUploading}
              />
            </div>

            {/* Video Upload */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                Video File
                <span className='ml-1 text-xs font-normal text-slate-400'>(MP4, MOV, AVI — max 200MB)</span>
              </label>

              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                videoFile
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50'
              } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}>
                <input
                  type="file"
                  accept='video/*'
                  className='hidden'
                  {...register('video', { required: true })}
                  disabled={isUploading}
                />
                {videoFile ? (
                  <div className='text-center p-3'>
                    <CheckCircle className='w-8 h-8 text-emerald-500 mx-auto mb-1' />
                    <p className='text-sm font-semibold text-emerald-700'>{videoFile.name}</p>
                    <p className='text-xs text-slate-500 mt-0.5'>{formatSize(videoFile.size)}</p>
                  </div>
                ) : (
                  <div className='text-center'>
                    <Upload className='w-8 h-8 text-slate-400 mx-auto mb-2' />
                    <p className='text-sm font-medium text-slate-600'>Click to select video</p>
                    <p className='text-xs text-slate-400 mt-1'>MP4, MOV, AVI supported</p>
                  </div>
                )}
              </label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium text-slate-700'>
                    {uploadProgress < 100 ? 'Uploading to Cloudinary...' : 'Processing video...'}
                  </span>
                  <span className='font-bold text-emerald-600'>{uploadProgress}%</span>
                </div>
                <div className='w-full h-3 bg-slate-200 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className='text-xs text-slate-400 text-center'>
                  ⏳ Large videos may take a few minutes. Please don't close this window.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type='submit'
              disabled={isUploading}
              className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none'
            >
              {isUploading ? (
                <>
                  <Spinner />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className='w-4 h-4' />
                  Upload Module
                </>
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modules List */}
      {data?.modules?.length === 0 && (
        <div className='mt-12 text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200'>
          <Video className='w-12 h-12 text-slate-300 mx-auto mb-3' />
          <p className='text-slate-500 font-medium'>No modules yet</p>
          <p className='text-sm text-slate-400'>Click "Add New Module" to upload your first lesson</p>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10'>
        {data?.modules?.map((item, index) => (
          <div key={item._id || index} className='group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer hover:border-emerald-300'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors'>
                <Video className='w-6 h-6 text-emerald-600' />
              </div>
              <div>
                <h3 className='font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1'>
                  {item.title}
                </h3>
                <p className='text-sm text-slate-500'>Module {index + 1}</p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className='w-full bg-slate-100 rounded-full h-2'>
              <div className='bg-emerald-500 h-2 rounded-full w-full'></div>
            </div>
            <p className='text-xs text-slate-400 mt-2'>Video uploaded ✓</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CreateModule
