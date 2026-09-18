import './styles/enhanced-dashboard.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import QueueMachineSimulator from './pages/QueueMachineSimulator'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      const defaultUser = {
        id: 'ph_001',
        name: 'LAMA',
        role: 'pharmacist',
        email: 'lama@hospital.com'
      }
      setUser(defaultUser)
      localStorage.setItem('user', JSON.stringify(defaultUser))
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    const defaultUser = {
      id: 'ph_001',
      name: 'LAMA',
      role: 'pharmacist',
      email: 'lama@hospital.com'
    }
    setUser(defaultUser)
    localStorage.setItem('user', JSON.stringify(defaultUser))
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
        <Route path="/simulator" element={<QueueMachineSimulator />} />
        <Route path="/dashboard" element={<QueueMachineSimulator />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

export default App