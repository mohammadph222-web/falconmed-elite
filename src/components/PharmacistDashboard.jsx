import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { generatePharmacistData, sadcoBenchmarkData, checkAlerts } from '../data/realData'
import * as dashboardApiModule from '../services/dashboardApi'

const { getMetrics, getHourlyData, getLiveStatus } = dashboardApiModule

export default function PharmacistDashboard({ user }) {
  const [dateFrom, setDateFrom] = useState('2026-08-27')
  const [dateTo, setDateTo] = useState('2026-08-29')
  
  // Backend Data States
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch Data from Backend
  useEffect(() => {
    console.log('🔵 useEffect started')
    
    const fetchData = async () => {
      setLoading(true)
      console.log('🟡 fetchData called')
      
      try {
        console.log('🟢 Calling getMetrics...')
        const metrics = await getMetrics()
        console.log('✅ getMetrics returned:', metrics)
        
        console.log('🟢 Calling getHourlyData...')
        const hourly = await getHourlyData(1)
        console.log('✅ getHourlyData returned:', hourly)
        
        console.log('🟢 Calling getLiveStatus...')
        const liveStatus = await getLiveStatus()
        console.log('✅ getLiveStatus returned:', liveStatus)
        
        setDashboardData({
          metrics,
          hourly,
          liveStatus
        })
        console.log('✅ dashboardData state updated')
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching data:', err)
        setError(err.message)
      }
      setLoading(false)
    }
    
    fetchData()
  }, [dateFrom, dateTo])

  // ✅ CHECK LOADING STATE FIRST
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // ✅ CHECK ERROR STATE
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg inline-block">
            <p className="text-red-700 font-semibold">❌ Error loading data</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ USE REAL API DATA (with fallback to mock if needed)
  const metrics = dashboardData?.metrics || generatePharmacistData(user.employeeId)
  const hourlyData = dashboardData?.hourly || sadcoBenchmarkData.hourlyDistribution.map(h => ({
    time: h.time,
    patients: h.patients,
    avgServiceTime: 3.0 + Math.random() * 0.5,
  }))
  
  // Structure data for easy access
  const data = {
    name: user.name || 'Pharmacist',
    totalPatients: metrics?.totalPatients || 189,
    identified: metrics?.identified || 187,
    unidentified: metrics?.unidentified || 2,
    avgServiceTime: metrics?.avgServiceTime || 3,
    avgWaitingTime: metrics?.avgWaitingTime || 5.08,
    rating: metrics?.rating || 4.8
  }

  const alerts = checkAlerts(data)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacist Dashboard</h1>
        <p className="text-gray-600">Personal Performance Overview - {data.name}</p>
      </div>

      {/* Date Range Selector */}
      <div className="card-elevated mb-8 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-md transition-all">
            Apply
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {alerts.map((alert, i) => (
            <div key={i} className={`alert-${alert.type} flex gap-3 items-start`}>
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{alert.title}</p>
                <p className="text-sm mt-1">{alert.message}</p>
                <p className="text-xs mt-2 opacity-75">Action: {alert.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Patients Served</div>
          <div className="text-3xl font-bold text-blue-600">{data.totalPatients}</div>
          <div className="text-green-600 text-sm mt-2">Today</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Identified</div>
          <div className="text-3xl font-bold text-emerald-600">{data.identified}</div>
          <div className="text-emerald-600 text-sm mt-2">{((data.identified/data.totalPatients)*100).toFixed(1)}%</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Unidentified</div>
          <div className="text-3xl font-bold text-orange-600">{data.unidentified}</div>
          <div className="text-orange-600 text-sm mt-2">{((data.unidentified/data.totalPatients)*100).toFixed(1)}%</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Avg Service Time</div>
          <div className="text-3xl font-bold text-cyan-600">{data.avgServiceTime}m</div>
          <div className="text-cyan-600 text-sm mt-2">Per Patient</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Waiting Time</div>
          <div className="text-3xl font-bold text-purple-600">{data.avgWaitingTime.toFixed(2)}m</div>
          <div className={`text-sm mt-2 ${data.avgWaitingTime > 5 ? 'text-red-600' : 'text-green-600'}`}>
            {data.avgWaitingTime > 5 ? '⚠️ High' : '✓ Normal'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Rating</div>
          <div className="text-3xl font-bold text-yellow-600">⭐ {data.rating}</div>
          <div className="text-yellow-600 text-sm mt-2">Excellent</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Hourly Distribution */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} /> Patients by Hour
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="patients" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Patients" />
              <Line type="monotone" dataKey="avgServiceTime" stroke="#f59e0b" strokeWidth={2} name="Service Time (m)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Identified vs Unidentified */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Patient Distribution</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={[
                  { name: 'Identified', value: data.identified, color: '#10b981' },
                  { name: 'Unidentified', value: data.unidentified, color: '#f59e0b' }
                ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{data.identified}</div>
              <div className="text-xs text-gray-600">Identified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.unidentified}</div>
              <div className="text-xs text-gray-600">Unidentified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="card-premium p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Insights</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sadcoBenchmarkData.quickInsights.map((insight, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl ${insight.color} mb-2`}>{insight.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
              <p className="text-xs text-gray-600 mt-2">{insight.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
