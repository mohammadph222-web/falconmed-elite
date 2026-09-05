import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, PieChart, Pie, Cell
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Globe, AlertCircle, 
  Download, Filter, Settings, Calendar, BarChart3, Zap
} from 'lucide-react'
import * as dashboardApiModule from '../services/dashboardApi'

const { getMetrics, getHourlyData, getLiveStatus } = dashboardApiModule

export default function AdminDashboard({ user }) {
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
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400 text-lg">Loading network dashboard...</p>
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

  // Network-level metrics (multiplied for multi-branch)
  const networkData = {
    totalPatients: (parseInt(metrics?.total_patients) || 0) * 5, // 5 branches
    identified: (parseInt(metrics?.identified) || 0) * 5,
    unidentified: (parseInt(metrics?.unidentified) || 0) * 5,
    avgServeRate: 99.3,
    avgNoShowRate: 0.7,
    activeBranches: 5,
    totalStaff: 25
  }

  const networkKpis = [
    {
      label: 'Network Patients',
      value: networkData.totalPatients,
      unit: 'All Branches',
      icon: Globe,
      color: 'from-purple-500 to-pink-600',
      trend: 2.1
    },
    {
      label: 'Identified',
      value: networkData.identified,
      unit: `${networkData.totalPatients > 0 ? ((networkData.identified/networkData.totalPatients)*100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      trend: 1.8
    },
    {
      label: 'Avg Serve Rate',
      value: networkData.avgServeRate.toFixed(1),
      unit: '%',
      icon: Zap,
      color: 'from-blue-500 to-cyan-600',
      trend: 0.3
    },
    {
      label: 'Avg No-Show',
      value: networkData.avgNoShowRate.toFixed(1),
      unit: '%',
      icon: TrendingDown,
      color: 'from-red-500 to-pink-600',
      trend: -0.1
    },
    {
      label: 'Active Branches',
      value: networkData.activeBranches,
      unit: 'Locations',
      icon: Globe,
      color: 'from-indigo-500 to-purple-600',
      trend: 0
    },
    {
      label: 'Total Staff',
      value: networkData.totalStaff,
      unit: 'Pharmacists',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
      trend: 2.0
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Network Admin Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">All Branches Performance</p>
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/25">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Network KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {networkKpis.map((kpi, idx) => {
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
          {/* Network Weekly Trend */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Network Weekly Trend</h2>
              <Filter size={18} className="text-slate-400 cursor-pointer hover:text-slate-300" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
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
                  stroke="#a855f7" 
                  fillOpacity={1} 
                  fill="url(#colorNetwork)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Performance */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <h2 className="text-lg font-bold text-white mb-6">Branch Performance Ranking</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Main Branch', patients: 1774, identified: 1757 },
                { name: 'Al Ain Branch', patients: 1650, identified: 1631 },
                { name: 'Khalifa Branch', patients: 1542, identified: 1521 },
                { name: 'Mafraq Branch', patients: 1489, identified: 1467 },
                { name: 'Startup Branch', patients: 1260, identified: 1238 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" angle={-45} height={100} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="patients" fill="#0ea5e9" name="Total Patients" />
                <Bar dataKey="identified" fill="#10b981" name="Identified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Comparison Table */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
          <h2 className="text-lg font-bold text-white mb-6">All Branches Summary</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-4 text-slate-300 font-semibold">Branch</th>
                  <th className="text-center py-4 px-4 text-slate-300 font-semibold">Total Patients</th>
                  <th className="text-center py-4 px-4 text-slate-300 font-semibold">Identified</th>
                  <th className="text-center py-4 px-4 text-slate-300 font-semibold">Serve Rate</th>
                  <th className="text-center py-4 px-4 text-slate-300 font-semibold">Staff</th>
                  <th className="text-center py-4 px-4 text-slate-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Main Branch', patients: 1774, identified: 1757, serveRate: 99.3, staff: 5, status: 'Excellent' },
                  { name: 'Al Ain Branch', patients: 1650, identified: 1631, serveRate: 98.9, staff: 5, status: 'Excellent' },
                  { name: 'Khalifa Branch', patients: 1542, identified: 1521, serveRate: 98.6, staff: 4, status: 'Good' },
                  { name: 'Mafraq Branch', patients: 1489, identified: 1467, serveRate: 98.5, staff: 4, status: 'Good' },
                  { name: 'Startup Branch', patients: 1260, identified: 1238, serveRate: 98.3, staff: 3, status: 'Good' }
                ].map((branch, idx) => (
                  <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-slate-200 font-medium">{branch.name}</td>
                    <td className="text-center py-4 px-4 text-white">{branch.patients}</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-emerald-400 font-semibold">{branch.identified}</span>
                    </td>
                    <td className="text-center py-4 px-4 text-green-400 font-semibold">{branch.serveRate}%</td>
                    <td className="text-center py-4 px-4 text-blue-400 font-semibold">{branch.staff}</td>
                    <td className="text-center py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {branch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
