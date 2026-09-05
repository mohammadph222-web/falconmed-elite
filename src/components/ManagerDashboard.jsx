import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Users, AlertCircle, 
  Download, Filter, Settings, Calendar, BarChart3, Award
} from 'lucide-react'
import * as dashboardApiModule from '../services/dashboardApi'

const { getMetrics, getHourlyData, getLiveStatus } = dashboardApiModule

export default function ManagerDashboard({ user }) {
  const [dateFrom, setDateFrom] = useState('2026-08-27')
  const [dateTo, setDateTo] = useState('2026-08-29')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [metricsResponse, hourlyResponse] = await Promise.all([
          getMetrics(),
          getHourlyData(1)
        ])

        const metrics = metricsResponse?.data || metricsResponse || null
        const hourly = hourlyResponse?.data || hourlyResponse || []

        setDashboardData({ metrics, hourly })
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
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400 text-lg">Loading branch dashboard...</p>
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
    totalPatients: parseInt(metrics?.total_patients) || 0,
    identified: parseInt(metrics?.identified) || 0,
    unidentified: parseInt(metrics?.unidentified) || 0,
    serveRate: 99.3,
    noShowRate: 0.7,
    avgServiceTime: parseFloat(metrics?.avg_service_time) || 0,
    avgWaitingTime: parseFloat(metrics?.avg_waiting_time) || 0,
    staffCount: 5
  }

  // Branch KPIs
  const branchKpis = [
    {
      label: 'Total Patients',
      value: data.totalPatients,
      unit: 'This Week',
      icon: Users,
      color: 'from-teal-500 to-cyan-600',
      trend: 3.2
    },
    {
      label: 'Identified',
      value: data.identified,
      unit: `${data.totalPatients > 0 ? ((data.identified/data.totalPatients)*100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      trend: 1.5
    },
    {
      label: 'Unidentified',
      value: data.unidentified,
      unit: `${data.totalPatients > 0 ? ((data.unidentified/data.totalPatients)*100).toFixed(1) : 0}%`,
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-600',
      trend: -0.3
    },
    {
      label: 'Serve Rate',
      value: data.serveRate.toFixed(1),
      unit: '%',
      icon: Award,
      color: 'from-emerald-500 to-green-600',
      trend: 0.5
    },
    {
      label: 'No-Show Rate',
      value: data.noShowRate.toFixed(1),
      unit: '%',
      icon: TrendingDown,
      color: 'from-red-500 to-pink-600',
      trend: -0.2
    },
    {
      label: 'Staff Count',
      value: data.staffCount,
      unit: 'Pharmacists',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      trend: 0
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Branch Manager Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Branch Performance Overview</p>
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Branch KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {branchKpis.map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <div
                key={idx}
                className="relative group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all hover:shadow-xl hover:shadow-slate-900/50 overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      {kpi.trend > 0 ? (
                        <>
                          <TrendingUp size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">+{kpi.trend}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={12} className="text-cyan-400" />
                          <span className="text-cyan-400">{kpi.trend}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-slate-400 text-xs font-medium mb-2">{kpi.label}</h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{kpi.value}</span>
                    <span className="text-xs text-slate-400">{kpi.unit}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Performance */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Weekly Performance</h2>
              <Filter size={18} className="text-slate-400 cursor-pointer hover:text-slate-300" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorWeekly)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Patient Identification */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <h2 className="text-lg font-bold text-white mb-6">Patient Identification</h2>
            
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
                      innerRadius={50}
                      outerRadius={90}
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

        {/* Top Performers */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
          <h2 className="text-lg font-bold text-white mb-6">Top Performers This Week</h2>
          
          <div className="space-y-4">
            {[
              { name: 'LAMA AL-REMIT', patients: 189, avgTime: 2.8, rating: 4.9 },
              { name: 'FATIMA AL-AMERI', patients: 176, avgTime: 3.1, rating: 4.7 },
              { name: 'AHMED AL-KAABI', patients: 168, avgTime: 3.2, rating: 4.6 },
              { name: 'SARA AL-SHAMMASI', patients: 156, avgTime: 3.4, rating: 4.5 },
              { name: 'MOHAMMED AL-MAZROUEI', patients: 145, avgTime: 3.5, rating: 4.4 }
            ].map((performer, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{performer.name}</p>
                    <p className="text-slate-400 text-xs">{performer.patients} patients</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Avg Time</p>
                    <p className="text-white font-semibold">{performer.avgTime}m</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Rating</p>
                    <p className="text-yellow-400 font-semibold">⭐ {performer.rating}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
