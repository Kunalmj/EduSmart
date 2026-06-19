import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLoggedOut } from '@/hooks/User.hook'
import { Spinner } from './ui/spinner'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/Store/user.store'
import { LogOut, User, LayoutDashboard, BookOpen, ChevronDown, Shield } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { mutate, isPending } = useLoggedOut()
  const { user } = useUserStore()
  const [open, setOpen] = useState(false)

  const logoutHandler = () => {
    setOpen(false)
    mutate()
  }

  const handleNavClick = (path) => {
    setOpen(false)
    navigate(path)
  }

  const navItems = [
    ...(user?.admin ? [{
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => handleNavClick('/dashboard'),
      color: 'text-purple-600',
      bg: 'hover:bg-purple-50'
    }] : []),
    {
      label: 'Profile',
      icon: User,
      onClick: () => handleNavClick('/profile'),
      color: 'text-slate-600',
      bg: 'hover:bg-slate-50'
    },
    {
      label: 'My Courses',
      icon: BookOpen,
      onClick: () => handleNavClick('/YourCourse'),
      color: 'text-emerald-600',
      bg: 'hover:bg-emerald-50'
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: logoutHandler,
      loading: isPending,
      color: 'text-red-600',
      bg: 'hover:bg-red-50',
      danger: true
    }
  ]

  return (
    <div className='h-[12vh] w-full flex items-center justify-between px-6 lg:px-12 shadow-sm bg-white border-b border-slate-100'>
      {/* Logo */}
      <div
        className='flex items-center gap-2 cursor-pointer'
        onClick={() => navigate('/')}
      >
        <div className='w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-black'>
          E
        </div>
        <h1 className='text-xl lg:text-2xl font-black text-slate-900 tracking-tight'>
          Edu<span className='text-indigo-600'>Smart</span>
        </h1>
      </div>

      {/* Right side */}
      <div className='flex items-center gap-4'>
        {/* Admin Badge */}
        {user?.admin && (
          <div className='hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold'>
            <Shield className='w-3.5 h-3.5' />
            Teacher
          </div>
        )}

        {/* User Menu */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className='flex items-center gap-3 p-2 pr-3 hover:bg-slate-100 rounded-xl transition-all duration-200 group cursor-pointer border border-transparent hover:border-slate-200'>
            <Avatar className='w-9 h-9 ring-2 ring-white shadow-md'>
              <AvatarImage
                src={user?.profilePhoto || ''}
                className='object-cover'
              />
              <AvatarFallback className='bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm'>
                {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className='hidden md:block text-left'>
              <p className='font-semibold text-sm text-slate-900 leading-tight'>
                {user?.fullName || 'User'}
              </p>
              <p className='text-xs text-slate-500 font-medium'>
                {user?.admin ? 'Teacher' : 'Student'}
              </p>
            </div>

            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </PopoverTrigger>

          <PopoverContent className='w-60 p-2 mt-1 border-slate-200 shadow-xl rounded-2xl bg-white' align='end'>
            {/* User info header */}
            <div className='px-3 py-3 mb-1 border-b border-slate-100'>
              <div className='flex items-center gap-3'>
                <Avatar className='w-10 h-10'>
                  <AvatarImage src={user?.profilePhoto || ''} className='object-cover' />
                  <AvatarFallback className='bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm'>
                    {user?.fullName?.slice(0, 2)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <p className='font-bold text-slate-900 text-sm truncate'>{user?.fullName}</p>
                  <p className='text-xs text-slate-500 truncate'>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <div className='space-y-0.5'>
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  disabled={item.loading}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all duration-150 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${item.color} ${item.bg} ${item.danger ? '' : 'text-slate-700'}`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                  <span>{item.label}</span>

                  {item.loading && (
                    <div className='ml-auto'>
                      <Spinner />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default Navbar
