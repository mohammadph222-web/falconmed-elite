import { useState } from 'react'
import { LogOut, Menu, X, BarChart3 } from 'lucide-react'
import PharmacistDashboard from '../pages/PharmacistDashboard'
import ManagerDashboard from '../pages/ManagerDashboard'
import AdminDashboard from '../pages/AdminDashboard'

export default function DashboardLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const getRoleDisplay = (role) => {
    const roles = {
      pharmacist: 'Pharmacist',
      manager: 'Branch Manager',
      admin: 'Administrator',
    }
    return roles[role] || role
  }

  const getRoleIcon = (role) => {
    const icons = {
      pharmacist: '💊',
      manager: '👨‍💼',
      admin: '👨‍💻',
    }
    return icons[role] || '👤'
  }

  const getRoleColor = (role) => {
    const colors = {
      pharmacist: 'from-blue-500 to-blue-600',
      manager: 'from-emerald-500 to-emerald-600',
      admin: 'from-purple-500 to-purple-600',
    }
    return colors[role] || 'from-slate-500 to-slate-600'
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-24'
        } bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 transition-all duration-300 ease-out flex flex-col fixed h-screen z-40 backdrop-blur-xl`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                💊
              </div>
              <div>
                <div className="text-slate-50 font-bold text-sm">FalconMed</div>
                <div className="text-slate-400 text-xs">Elite v3.0</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Card */}
        {sidebarOpen && (
          <div
            className={`mx-4 mt-6 p-4 rounded-xl bg-gradient-to-r ${getRoleColor(
              user.role
            )} text-white shadow-lg transition-all duration-300 hover:shadow-xl`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-base backdrop-blur-sm">
                {getRoleIcon(user.role)}
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {user.name.split(' ')[0]}
                </p>
                <p className="text-white/80 text-xs leading-tight">
                  {getRoleDisplay(user.role)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2 mt-8">
          {sidebarOpen && (
            <div className="text-xs text-slate-500 uppercase tracking-widest px-3 mb-4 font-semibold">
              Main
            </div>
          )}

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-slate-100 border border-blue-500/30 font-semibold text-sm transition-all duration-200 hover:from-blue-500/30 hover:to-cyan-500/30 group"
            title={sidebarOpen ? '' : 'Dashboard'}
          >
            <BarChart3 size={20} className="text-blue-400 flex-shrink-0" />
            {sidebarOpen && 'Dashboard'}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-400 font-semibold text-sm border border-red-500/30 transition-all duration-200 group"
            title={sidebarOpen ? '' : 'Logout'}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="px-4 py-3 text-xs text-slate-500 border-t border-slate-700/50">
            <p className="text-center">v3.0.1</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`${
          sidebarOpen ? 'ml-64' : 'ml-24'
        } flex-1 flex flex-col transition-all duration-300 ease-out overflow-y-auto overflow-x-hidden`}
      >
        {/* Top Bar - Mobile */}
        <div className="md:hidden bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 p-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              💊
            </div>
            <span className="text-slate-50 font-bold">FalconMed Elite</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 lg:p-10">
            {user.role === 'pharmacist' && <PharmacistDashboard user={user} />}
            {user.role === 'manager' && <ManagerDashboard user={user} />}
            {user.role === 'admin' && <AdminDashboard user={user} />}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}