import './styles/enhanced-dashboard.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'
import QueueMachineSimulator from './pages/QueueMachineSimulator'

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

  return (
    <Router>
      <Routes>
        {/* Queue Machine Simulator - Public */}
        <Route path="/simulator" element={<QueueMachineSimulator />} />
        
        {/* Login Page */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />
        
        {/* Dashboard - Protected */}
        <Route path="/dashboard" element={
          user ? <DashboardLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        } />
        
        {/* Default Route */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  )
}

export default App