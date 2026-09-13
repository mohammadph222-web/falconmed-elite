import './styles/enhanced-dashboard.css'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💊</div>
          <p className="text-slate-50 text-xl font-semibold">FalconMed Elite</p>
          <p className="text-slate-400 text-sm mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? (
    <DashboardLayout user={user} onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  )
}

export default App
