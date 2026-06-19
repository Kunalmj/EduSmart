import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Home,
  BarChart3,
  LogOut
} from 'lucide-react'
import { useLoggedOut } from '@/hooks/User.hook'

const DashboardSideBar = () => {
  const { mutate: logout, isPending } = useLoggedOut()
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Analytics', icon: BarChart3 },
    { to: '/dashboard/dashboardProduct', label: 'Courses', icon: ShoppingBag },
    
  ]

  return (
    <div className='w-64 bg-white shadow-xl border-r border-slate-200 flex flex-col min-h-screen'>
      <div className='p-6 border-b border-slate-200'>
        <h1 className='text-2xl font-black text-slate-900 tracking-tight'>EduSmart</h1>
        <p className='text-xs text-slate-500 font-medium mt-1'>Admin Dashboard</p>
      </div>

      <nav className='p-4 space-y-1 flex-1'>
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) => 
              `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
              ${isActive 
                ? 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-700' 
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md'
              }`
            }
          >
            <item.icon className='w-5 h-5 flex-shrink-0' />
            <span className='truncate'>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className='p-4 border-t border-slate-200'>
        <button
          onClick={() => logout()}
          disabled={isPending}
          className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50'
        >
          <LogOut className='w-5 h-5 flex-shrink-0' />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default DashboardSideBar
