import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Clock, Users, AlertCircle, 
  Download, Filter, Settings, Calendar, BarChart3, Zap
} from 'lucide-react'
import * as dashboardApiModule from '../services/dashboardApi'

const { getMetrics, getHourlyData, getLiveStatus } = dashboardApiModule

export default function PharmacistDashboard({ user }) {
  const [dateFrom, setDateFrom] = useState('2026-08-27')
  const [dateTo, setDateTo] = useState('2026-08-29')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('overview') // overview, detailed, comparison

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const metricsResponse = await getMetrics()
        const metrics = metricsResponse?.data || metricsResponse || null
        
        const hourlyResponse = await getHourlyData(1)
        const hourly = hourlyResponse?.data || hourlyResponse || []
        
        const liveStatusResponse = await getLiveStatus()
        const liveStatus = liveStatusResponse?.data || liveStatusResponse || null
        
        setDashboardData({ metrics, hourly, liveStatus })
        setError(null)
      } catch (err) {
        setError(err.message)
      }
      setLoading(false)
    }
    
    fetchData()
  }, [dateFrom, dateTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-900/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-300 font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-red-200/70 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const metrics = dashboardData?.metrics || null
  const hourlyData = dashboardData?.hourly || []
  
  const data = {
    name: user.name || 'Pharmacist',
    totalPatients: parseInt(metrics?.total_patients) || 0,
    identified: parseInt(metrics?.identified) || 0,
    unidentified: parseInt(metrics?.unidentified) || 0,
    avgServiceTime: parseFloat(metrics?.avg_service_time) || 0,
    avgWaitingTime: parseFloat(metrics?.avg_waiting_time) || 0,
    rating: parseFloat(metrics?.rating) || 4.8
  }

  // Performance metrics for radar chart
  const performanceData = [
    { category: 'Speed', value: Math.min((12 - data.avgServiceTime) / 12 * 100, 100) },
    { category: 'Efficiency', value: Math.min(((data.totalPatients / 24) * 100), 100) },
    { category: 'Quality', value: data.rating * 20 },
    { category: 'Accuracy', value: data.totalPatients > 0 ? (data.identified / data.totalPatients) * 100 : 0 },
    { category: 'Satisfaction', value: 92 }
  ]

  // KPI Cards with trend indicators
  const kpis = [
    {
      label: 'Patients Served',
      value: data.totalPatients,
      unit: 'today',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      trend: 5.2,
      comparison: 'vs yesterday'
    },
    {
      label: 'Identified',
      value: data.identified,
      unit: `${data.totalPatients > 0 ? ((data.identified/data.totalPatients)*100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      trend: 2.1,
      comparison: 'vs yesterday'
    },
    {
      label: 'Avg Service Time',
      value: data.avgServiceTime.toFixed(1),
      unit: 'minutes',
      icon: Clock,
      color: 'from-cyan-500 to-blue-600',
      trend: -1.5,
      comparison: 'faster'
    },
    {
      label: 'Waiting Time',
      value: data.avgWaitingTime.toFixed(2),
      unit: 'minutes',
      icon: AlertCircle,
      color: data.avgWaitingTime > 5 ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-green-600',
      trend: data.avgWaitingTime > 5 ? 1.2 : -0.8,
      comparison: 'vs target'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Pharmacist Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Personal Performance Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                <Settings size={20} />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Date Range Filter */}
        <div className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-2">From Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-2">To Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/25">
              Apply Filters
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <div
                key={idx}
                className="relative group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all hover:shadow-xl hover:shadow-slate-900/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      {kpi.trend > 0 ? (
                        <>
                          <TrendingUp size={14} className="text-emerald-400" />
                          <span className="text-emerald-400">+{kpi.trend}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={14} className="text-cyan-400" />
                          <span className="text-cyan-400">{kpi.trend}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-slate-400 text-sm font-medium mb-2">{kpi.label}</h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{kpi.value}</span>
                    <span className="text-sm text-slate-400">{kpi.unit}</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-3">{kpi.comparison}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart - Hourly Patients */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Hourly Distribution</h2>
              <Filter size={18} className="text-slate-400 cursor-pointer hover:text-slate-300" />
            </div>
            
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#colorPatients)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No hourly data available
              </div>
            )}
          </div>

          {/* Performance Radar */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <h2 className="text-lg font-bold text-white mb-6">Performance Score</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
                <Radar 
                  name="Performance" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  fill="#0ea5e9" 
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section - Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service vs Waiting Time */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <h2 className="text-lg font-bold text-white mb-6">Time Analysis</h2>
            
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={[
                { name: 'Service Time', value: data.avgServiceTime, target: 4 },
                { name: 'Waiting Time', value: data.avgWaitingTime, target: 5 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#0ea5e9" name="Actual" />
                <Bar dataKey="target" fill="#06b6d4" name="Target" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Patient Breakdown */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <h2 className="text-lg font-bold text-white mb-6">Patient Distribution</h2>
            
            {data.totalPatients > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Identified', value: data.identified, color: '#10b981' },
                        { name: 'Unidentified', value: data.unidentified, color: '#f59e0b' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-emerald-500/20">
                    <p className="text-slate-400 text-sm mb-2">Identified</p>
                    <p className="text-2xl font-bold text-emerald-400">{data.identified}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-amber-500/20">
                    <p className="text-slate-400 text-sm mb-2">Unidentified</p>
                    <p className="text-2xl font-bold text-amber-400">{data.unidentified}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400">
                No patient data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
