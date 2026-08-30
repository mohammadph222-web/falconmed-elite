import { useState } from 'react'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'

const demoUsers = {
  'pharmacist@falconmed.com': {
    id: 'usr_ph_001',
    email: 'pharmacist@falconmed.com',
    name: 'LAMA AL-REMIT',
    role: 'pharmacist',
    employeeId: 1,
    branch: 'Main Branch',
    password: '123456'
  },
  'manager@falconmed.com': {
    id: 'usr_mg_001',
    email: 'manager@falconmed.com',
    name: 'Fatima Al-Ameri',
    role: 'manager',
    branchId: 'br_001',
    branch: 'Main Branch',
    password: '123456'
  },
  'admin@falconmed.com': {
    id: 'usr_ad_001',
    email: 'admin@falconmed.com',
    name: 'Mohammed Al-Kaabi',
    role: 'admin',
    password: '123456'
  }
}

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('pharmacist@falconmed.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const user = demoUsers[email]

      if (!user) {
        setError('Email not found')
        setIsLoading(false)
        return
      }

      if (user.password !== password) {
        setError('Invalid password')
        setIsLoading(false)
        return
      }

      onLoginSuccess(user)
      setIsLoading(false)
    }, 600)
  }

  const handleQuickLogin = (userEmail) => {
    const user = demoUsers[userEmail]
    if (user) {
      onLoginSuccess(user)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">💊</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FalconMed Elite</h1>
          <p className="text-gray-600 font-medium">Pharmacy Management Dashboard v3.0</p>
        </div>

        {/* Login Card */}
        <div className="card-premium mb-6 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

          {error && (
            <div className="alert-danger mb-6 flex gap-3 items-start">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-md hover:shadow-lg"
            >
              <LogIn size={20} />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-xs font-medium">QUICK ACCESS</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Quick Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('pharmacist@falconmed.com')}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 font-semibold py-3 rounded-lg transition-all"
            >
              👨‍⚕️ Pharmacist Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@falconmed.com')}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200 font-semibold py-3 rounded-lg transition-all"
            >
              👔 Manager Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@falconmed.com')}
              className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 font-semibold py-3 rounded-lg transition-all"
            >
              🔐 Admin Dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs">
          <p>© 2026 FalconMed • Professional Pharmacy Management</p>
          <p className="mt-1 text-gray-500">Version 3.0 Elite Edition</p>
        </div>
      </div>
    </div>
  )
}
