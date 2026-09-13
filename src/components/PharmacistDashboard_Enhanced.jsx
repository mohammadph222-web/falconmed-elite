import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Filter, Download, Settings } from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import LivePatients from '../components/LivePatients'

export default function PharmacistDashboard({ user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fromDate, setFromDate] = useState('2026-08-27')
  const [toDate, setToDate] = useState('2026-08-29')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        'https://falconmed-backend.onrender.com/api/queue/stats'
      )
      if (!response.ok) throw new Error('Failed to fetch data')

      const result = await response.json()
      if (result.success) {
        // Parse numeric strings
        const parsedData = {
          total_patients: parseInt(result.data.total_patients) || 0,
          identified: parseInt(result.data.identified) || 0,
          unidentified: parseInt(result.data.unidentified) || 0,
          avg_service_time: parseFloat(result.data.avg_service_time) || 0,
          avg_waiting_time: parseFloat(result.data.avg_waiting_time) || 0,
          in_service: parseInt(result.data.in_service) || 0,
          waiting: parseInt(result.data.waiting) || 0,
        }
        setData(parsedData)
      }
    } catch (err) {
      setError(err.message)
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    console.log('Applying filters:', { fromDate, toDate })
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-300 font-semibold">Error loading dashboard</p>
        <p className="text-red-200 text-sm mt-2">{error}</p>
      </div>
    )
  }

  const identifiedPercentage =
    data && data.total_patients > 0
      ? ((data.identified / data.total_patients) * 100).toFixed(1)
      : 0

  const patientsData = [
    {
      name: 'Completed',
      value: data?.total_patients || 0,
      fill: '#0ea5e9',
    },
    {
      name: 'In Service',
      value: data?.in_service || 0,
      fill: '#06b6d4',
    },
  ]

  const hourlyData = [
    { hour: '08:00', patients: 12 },
    { hour: '09:00', patients: 18 },
    { hour: '10:00', patients: 24 },
    { hour: '11:00', patients: 28 },
    { hour: '12:00', patients: 22 },
    { hour: '13:00', patients: 16 },
    { hour: '14:00', patients: 32 },
    { hour: '15:00', patients: 35 },
    { hour: '16:00', patients: 28 },
  ]

  const performanceData = [
    { category: 'Speed', value: 85 },
    { category: 'Accuracy', value: 92 },
    { category: 'Efficiency', value: 78 },
    { category: 'Quality', value: 88 },
    { category: 'Service', value: 90 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-header-title">Pharmacist Dashboard</h1>
        <p className="dashboard-header-subtitle">Personal Performance Analytics</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label className="filter-label">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="filter-input"
          />
        </div>

        <button
          onClick={handleApplyFilters}
          className="filter-button"
        >
          Apply Filters
        </button>

        <button className="filter-button bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 ml-auto">
          <Download size={16} className="mr-2" />
          Export
        </button>
      </div>

        {/* Live Patients Queue */}
        <LivePatients />

      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        {/* Patients Served */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box">👥</div>
            <div className="kpi-trend up">
              <TrendingUp size={14} />
              +5.2%
            </div>
          </div>
          <div>
            <p className="kpi-label">Patients Served</p>
            <p className="kpi-value">{data?.total_patients || 0}</p>
            <p className="kpi-subtext">today</p>
            <p className="kpi-subtext" style={{ marginTop: '4px' }}>vs yesterday</p>
          </div>
        </div>

        {/* Identified Patients */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box">✓</div>
            <div className="kpi-trend up">
              <TrendingUp size={14} />
              +2.1%
            </div>
          </div>
          <div>
            <p className="kpi-label">Identified</p>
            <p className="kpi-value">{data?.identified || 0}</p>
            <p className="kpi-subtext">{identifiedPercentage}%</p>
            <p className="kpi-subtext" style={{ marginTop: '4px' }}>vs yesterday</p>
          </div>
        </div>

        {/* Avg Service Time */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box">⏱️</div>
            <div className="kpi-trend down">
              <TrendingDown size={14} />
              -1.5%
            </div>
          </div>
          <div>
            <p className="kpi-label">Avg Service Time</p>
            <p className="kpi-value">{data?.avg_service_time?.toFixed(1) || 0}</p>
            <p className="kpi-subtext">minutes</p>
            <p className="kpi-subtext" style={{ marginTop: '4px' }}>faster</p>
          </div>
        </div>

        {/* Waiting Time */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box">⌛</div>
            <div className="kpi-trend down">
              <TrendingDown size={14} />
              -0.8%
            </div>
          </div>
          <div>
            <p className="kpi-label">Waiting Time</p>
            <p className="kpi-value">{data?.avg_waiting_time?.toFixed(2) || 0}</p>
            <p className="kpi-subtext">minutes</p>
            <p className="kpi-subtext" style={{ marginTop: '4px' }}>vs target</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Hourly Distribution */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Hourly Distribution</h3>
            <button className="chart-action">
              <Filter size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(51, 65, 85, 0.2)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Area
                type="monotone"
                dataKey="patients"
                stroke="#0ea5e9"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPatients)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Score */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Performance Score</h3>
            <div className="text-2xl font-bold text-blue-400">87.7</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(51, 65, 85, 0.2)"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="charts-grid">
        {/* Patient Status */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Patient Status</h3>
            <button className="chart-action">
              <Settings size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={patientsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {patientsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Service Quality */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Service Quality</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Accuracy', value: 92, color: 'from-blue-500 to-blue-600' },
              { label: 'Speed', value: 85, color: 'from-cyan-500 to-cyan-600' },
              { label: 'Efficiency', value: 78, color: 'from-emerald-500 to-emerald-600' },
              { label: 'Customer Satisfaction', value: 88, color: 'from-purple-500 to-purple-600' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-blue-400">
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
