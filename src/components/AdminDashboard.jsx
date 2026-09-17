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

// ✅ استخدم الـ 4 Admin endpoints الجديدة
const { 
  getNetworkStats, 
  getNetworkBranches, 
  getNetworkTrends, 
  getNetworkStaff 
} = dashboardApiModule

export default function AdminDashboard({ user }) {
  const [dateFrom, setDateFrom] = useState('2026-08-27')
  const [dateTo, setDateTo] = useState('2026-08-29')
  const [granularity, setGranularity] = useState('daily')
  
  const [networkStats, setNetworkStats] = useState(null)
  const [branches, setBranches] = useState([])
  const [trends, setTrends] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // ✅ جلب جميع البيانات من الـ 4 endpoints الجديدة
        const [statsRes, branchesRes, trendsRes, staffRes] = await Promise.all([
          getNetworkStats(dateFrom, dateTo),
          getNetworkBranches(dateFrom, dateTo),
          getNetworkTrends(dateFrom, dateTo, granularity),
          getNetworkStaff(dateFrom, dateTo, 10),
        ])

        // ✅ معالجة البيانات
        const stats = statsRes?.data || {}
        const branchesData = branchesRes?.data?.branches || []
        const trendsData = trendsRes?.data?.trends || []
        const staffData = staffRes?.data || []

        setNetworkStats(stats)
        setBranches(branchesData)
        setTrends(trendsData)
        setStaff(staffData)
        setIsDemoData(
          statsRes?.isDemoData || 
          branchesRes?.isDemoData || 
          trendsRes?.isDemoData || 
          staffRes?.isDemoData
        )
        
        setError(null)
      } catch (err) {
        console.error('Error loading admin dashboard:', err)
        setError(err?.message || 'Failed to load dashboard data')
        setNetworkStats(null)
        setBranches([])
        setTrends([])
        setStaff([])
      }
      setLoading(false)
    }
    
    fetchData()
  }, [dateFrom, dateTo, granularity])

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

  const stats = networkStats || {}

  // ✅ Network-level metrics - من real data
  const networkData = {
    totalPatients: parseInt(stats?.total_patients) || 0,
    identified: parseInt(stats?.identified) || 0,
    unidentified: parseInt(stats?.unidentified) || 0,
    avgServeRate: parseFloat(stats?.serve_rate) || 0,
    avgNoShowRate: 100 - (parseFloat(stats?.serve_rate) || 0),
    activeBranches: parseInt(stats?.active_branches) || 0,
    totalStaff: parseInt(stats?.total_staff) || 0,
    avgWaitingTime: parseFloat(stats?.avg_waiting_time) || 0,
    avgServiceTime: parseFloat(stats?.avg_service_time) || 0,
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
      label: 'Avg Service Time',
      value: networkData.avgServiceTime.toFixed(1),
      unit: 'min',
      icon: TrendingDown,
      color: 'from-orange-500 to-yellow-600',
      trend: -0.5
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
              <h1 className="text-2xl font-bold text-white">Network Admin Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Real-time network performance analytics</p>
            </div>
            <div className="flex items-center gap-3">
              {isDemoData && (
                <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-xs font-semibold">
                  ⚠️ Demo Data
                </div>
              )}
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Download size={18} className="text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <Settings size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Granularity</label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
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
          {/* Network Trends */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Network Trend ({granularity})</h2>
              <Filter size={18} className="text-slate-400 cursor-pointer hover:text-slate-300" />
            </div>
            
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" />
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
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400">
                No trend data available
              </div>
            )}
          </div>

          {/* Branch Performance */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all">
            <h2 className="text-lg font-bold text-white mb-6">Branch Performance Ranking</h2>
            
            {branches.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branches}>
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
                  <Bar dataKey="total_patients" fill="#0ea5e9" name="Total Patients" />
                  <Bar dataKey="identified" fill="#10b981" name="Identified" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400">
                No branch data available
              </div>
            )}
          </div>
        </div>

        {/* Branch Comparison Table */}
        {branches.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/80 transition-all mb-8">
            <h2 className="text-lg font-bold text-white mb-6">All Branches Summary</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-4 px-4 text-slate-300 font-semibold">Branch</th>
                    <th className="text-center py-4 px-4 text-slate-300 font-semibold">Total Patients</th>
                    <th className="text-center py-4 px-4 text-slate-300 font-semibold">Identified</th>
                    <th className="text-center py-4 px-4 text-slate-300 font-semibold">Serve Rate</th>
                    <th className="text-center py-4 px-4 text-slate-300 font-semibold">Avg Time</th>
                    <th className="text-center py-4 px-4 text-slate-300 font-semibold">Staff</th>
                    <th className="text-center py-4 px-4 text-slate-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch, idx) => (
                    <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 text-slate-200 font-medium">{branch.name}</td>
                      <td className="text-center py-4 px-4 text-white">{branch.total_patients}</td>
                      <td className="text-center py-4 px-4">
                        <span className="text-emerald-400 font-semibold">{branch.identified}</span>
                      </td>
                      <td className="text-center py-4 px-4 text-green-400 font-semibold">{branch.serve_rate?.toFixed(1)}%</td>
                      <td className="text-center py-4 px-4 text-cyan-400 font-semibold">{branch.avg_service_time?.toFixed(1)}m</td>
                      <td className="text-center py-4 px-4 text-blue-400 font-semibold">{branch.staff_count}</td>
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
        )}

        {/* Top Staff */}
        {staff.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Top Performing Staff (Network-wide)</h2>
            
            <div className="space-y-4">
              {staff.map((person, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{person.staff_name}</p>
                      <p className="text-slate-400 text-xs">{person.branch_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Patients Served</p>
                      <p className="text-white font-semibold">{person.patients_served}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Avg Time</p>
                      <p className="text-white font-semibold">{person.avg_service_time?.toFixed(1)}m</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Rating</p>
                      <p className="text-yellow-400 font-semibold">⭐ {person.rating?.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
