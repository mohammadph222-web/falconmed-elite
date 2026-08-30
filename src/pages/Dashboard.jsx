import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import PharmacistDashboard from '../components/PharmacistDashboard'
import ManagerDashboard from '../components/ManagerDashboard'
import AdminDashboard from '../components/AdminDashboard'

export default function Dashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const getRoleDisplay = (role) => {
    const roles = {
      pharmacist: 'Pharmacist',
      manager: 'Branch Manager',
      admin: 'Administrator'
    }
    return roles[role] || role
  }

  const getRoleColor = (role) => {
    const colors = {
      pharmacist: 'from-blue-600 to-blue-700',
      manager: 'from-emerald-600 to-emerald-700',
      admin: 'from-purple-600 to-purple-700'
    }
    return colors[role] || 'from-gray-600 to-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-screen md:relative z-40`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                💊
              </div>
              <div>
                <div className="text-gray-900 font-bold text-sm">FalconMed</div>
                <div className="text-gray-500 text-xs">Elite v3.0</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-600 md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* User Card */}
        {sidebarOpen && (
          <div className={`mx-4 mt-6 p-4 rounded-lg bg-gradient-to-r ${getRoleColor(user.role)} text-white shadow-md`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-white/80 text-xs">{getRoleDisplay(user.role)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {sidebarOpen && (
          <nav className="flex-1 px-4 space-y-2 mt-6">
            <div className="text-xs text-gray-500 uppercase tracking-wider px-4 mb-4 font-semibold">Main</div>
            <div className="px-4 py-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-sm">
              📊 Dashboard
            </div>
          </nav>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm border border-red-200 transition-all"
          >
            <LogOut size={18} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-gray-900 font-bold">FalconMed Elite</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {user.role === 'pharmacist' && <PharmacistDashboard user={user} />}
          {user.role === 'manager' && <ManagerDashboard user={user} />}
          {user.role === 'admin' && <AdminDashboard user={user} />}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
