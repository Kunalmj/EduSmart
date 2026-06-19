import { Spinner } from '@/components/ui/spinner'
import { useGetSingleCourseHook, useGetAllPurchaseCourse } from '@/hooks/course.hook'
import { usePayment } from '@/hooks/payment.hook'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Clock, Star, Users, CheckCircle, Play, Lock, Shield } from 'lucide-react'

const SingleCourse = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useGetSingleCourseHook(id)
  const { data: purchasedData } = useGetAllPurchaseCourse()
  const { mutate, isPending } = usePayment()

  // Check if user already owns this course
  const alreadyPurchased = purchasedData?.purchasedCourse?.some(
    (c) => c._id === id || c === id
  )

  const purchaseHandler = (course) => {
    const product = {
      products: {
        _id: course._id,
        name: course.title,
        price: course.amount,
        image: course.thumbnail,
      },
    }
    mutate(product)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-slate-600 font-medium">Loading course...</p>
        </div>
      </div>
    )
  }

  const modules = data?.modules || []
  const originalPrice = Number(data?.amount) + 999

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
              <button onClick={() => navigate('/')} className="hover:text-white transition">Home</button>
              <span>/</span>
              <span className="text-white">Course Details</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              {data?.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              {data?.description || "Upgrade your skills with this comprehensive professional course."}
            </p>

            {/* Ratings / Info Row */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-bold text-yellow-400">4.8</span>
                <span className="text-slate-400 text-sm">(2.4k ratings)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <Users className="w-4 h-4" />
                <span>1.2k students</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{modules.length} modules</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <Clock className="w-4 h-4" />
                <span>12 hours</span>
              </div>
            </div>

            {/* Price + CTA (mobile view) */}
            <div className="flex items-center gap-4 md:hidden">
              <div>
                <span className="text-3xl font-black text-emerald-400">₹{data?.amount}</span>
                <span className="text-slate-500 line-through ml-2 text-sm">₹{originalPrice}</span>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="hidden md:block">
            <div className="relative">
              <img
                src={data?.thumbnail}
                alt={data?.title}
                className="w-full rounded-2xl shadow-2xl object-cover max-h-80"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Course' }}
              />
              {!alreadyPurchased && (
                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Lock className="w-7 h-7 text-slate-700" />
                  </div>
                </div>
              )}
              {alreadyPurchased && (
                <div className="absolute inset-0 bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">

        {/* Left: Course Content */}
        <div className="md:col-span-2 space-y-8">
          {/* What you'll learn */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">What you'll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Hands-on practical projects',
                'Industry-standard techniques',
                'Certificate of completion',
                'Lifetime access to materials',
                'Expert instructor support',
                'Real-world case studies'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Modules */}
          {modules.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Course Content
                <span className="ml-2 text-sm font-normal text-slate-500">({modules.length} modules)</span>
              </h2>
              <div className="space-y-2">
                {modules.map((mod, index) => (
                  <div
                    key={mod._id || index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-800 flex-1">{mod.title}</span>
                    {alreadyPurchased ? (
                      <Play className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Purchase Card */}
        <div className="md:col-span-1">
          <div className="sticky top-6 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Price Header */}
            <div className="p-6 border-b border-slate-100">
              {alreadyPurchased ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-700 text-lg">You own this course</p>
                  <p className="text-sm text-slate-500 mt-1">Click below to start learning</p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-slate-900">₹{data?.amount}</span>
                    <span className="text-slate-400 line-through text-lg">₹{originalPrice}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                    Save ₹999 — Limited offer!
                  </div>
                </>
              )}
            </div>

            <div className="p-6 space-y-3">
              {alreadyPurchased ? (
                <button
                  onClick={() => navigate(`/YourCourse/${id}`)}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Continue Learning
                </button>
              ) : (
                <button
                  disabled={isPending}
                  onClick={() => purchaseHandler(data)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? <Spinner /> : '🔒 Enroll Now'}
                </button>
              )}

              {!alreadyPurchased && (
                <p className="text-center text-xs text-slate-400">
                  30-day money-back guarantee
                </p>
              )}

              {/* Includes */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <p className="text-sm font-semibold text-slate-700 mb-2">This course includes:</p>
                {[
                  { icon: BookOpen, text: `${modules.length} video modules` },
                  { icon: Clock, text: 'Lifetime access' },
                  { icon: Shield, text: 'Certificate of completion' },
                  { icon: Users, text: 'Community support' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleCourse
