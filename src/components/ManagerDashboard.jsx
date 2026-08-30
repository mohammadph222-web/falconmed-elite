import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertCircle, Users } from 'lucide-react'
import { generateBranchData, sadcoBenchmarkData, checkAlerts } from '../data/realData'

export default function ManagerDashboard({ user }) {
  const [dateFrom, setDateFrom] = useState('2026-08-27')
  const [dateTo, setDateTo] = useState('2026-08-29')

  const data = generateBranchData(user.branchId)
  const alerts = checkAlerts(data)

  const weeklyData = [
    { day: 'Mon', patients: 1574, serveRate: 98.8, noShow: 18 },
    { day: 'Tue', patients: 1698, serveRate: 99.1, noShow: 15 },
    { day: 'Wed', patients: 1756, serveRate: 99.2, noShow: 14 },
    { day: 'Thu', patients: 1774, serveRate: 99.3, noShow: 12 },
    { day: 'Fri', patients: 1623, serveRate: 98.9, noShow: 17 },
    { day: 'Sat', patients: 892, serveRate: 98.5, noShow: 13 },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Branch Manager Dashboard</h1>
        <p className="text-gray-600">Branch Performance - {user.branch}</p>
      </div>

      {/* Date Range */}
      <div className="card-elevated mb-8 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg" />
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-md">Apply</button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {alerts.map((alert, i) => (
            <div key={i} className={`alert-${alert.type} flex gap-3`}>
              <AlertCircle size={20} className="flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{alert.title}</p>
                <p className="text-sm">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Total Patients</div>
          <div className="text-3xl font-bold text-emerald-600">{data.totalPatients}</div>
          <div className="text-emerald-600 text-sm mt-2">This Week</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Identified</div>
          <div className="text-3xl font-bold text-blue-600">{data.identified}</div>
          <div className="text-blue-600 text-sm mt-2">{((data.identified/data.totalPatients)*100).toFixed(1)}%</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Unidentified</div>
          <div className="text-3xl font-bold text-orange-600">{data.unidentified}</div>
          <div className="text-orange-600 text-sm mt-2">{((data.unidentified/data.totalPatients)*100).toFixed(1)}%</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Serve Rate</div>
          <div className="text-3xl font-bold text-green-600">{data.serveRate}%</div>
          <div className="text-green-600 text-sm mt-2">Efficiency</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">No-Show Rate</div>
          <div className="text-3xl font-bold text-red-600">{data.noShowRate}%</div>
          <div className={`text-sm mt-2 ${data.noShowRate > 1 ? 'text-red-600' : 'text-green-600'}`}>
            {data.noShowRate > 1 ? '⚠️ High' : '✓ Low'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Staff Count</div>
          <div className="text-3xl font-bold text-purple-600">{data.employees.length}</div>
          <div className="text-purple-600 text-sm mt-2">Pharmacists</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Performance */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={20} /> Weekly Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="patients" fill="#10b981" radius={[8, 8, 0, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Rankings */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="text-blue-600" size={20} /> Top Performers
          </h2>
          <div className="space-y-3">
            {data.employees.slice(0, 5).map((emp, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                  <p className="text-xs text-gray-600">{emp.patients} patients</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-600 font-bold">⭐ {emp.rating}</p>
                  <p className="text-xs text-gray-600">{emp.serviceTime}m avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <div className="card-premium p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Hourly Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
            <Legend />
            <Bar dataKey="patients" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Total Patients" />
            <Bar dataKey="identified" fill="#10b981" radius={[8, 8, 0, 0]} name="Identified" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
