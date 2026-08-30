import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertCircle, Building2 } from 'lucide-react'
import { generateNetworkData, sadcoBenchmarkData, checkAlerts } from '../data/realData'

export default function AdminDashboard({ user }) {
  const [dateFrom, setDateFrom] = useState('2026-08-27')
  const [dateTo, setDateTo] = useState('2026-08-29')

  const data = generateNetworkData()
  const alerts = checkAlerts(data)

  const networkTrend = [
    { day: 'Mon', patients: 7870, serveRate: 98.8 },
    { day: 'Tue', patients: 8490, serveRate: 99.1 },
    { day: 'Wed', patients: 8780, serveRate: 99.2 },
    { day: 'Thu', patients: 8870, serveRate: 99.3 },
    { day: 'Fri', patients: 8115, serveRate: 98.9 },
    { day: 'Sat', patients: 4460, serveRate: 98.5 },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Network Administration Dashboard</h1>
        <p className="text-gray-600">All Branches - System Overview</p>
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
          <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-md">Apply</button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Network Patients</div>
          <div className="text-3xl font-bold text-purple-600">{(data.totalPatients/1000).toFixed(1)}K</div>
          <div className="text-purple-600 text-sm mt-2">All Branches</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Identified</div>
          <div className="text-3xl font-bold text-green-600">{(data.totalIdentified/1000).toFixed(1)}K</div>
          <div className="text-green-600 text-sm mt-2">{((data.totalIdentified/data.totalPatients)*100).toFixed(1)}%</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Unidentified</div>
          <div className="text-3xl font-bold text-orange-600">{data.totalUnidentified}</div>
          <div className="text-orange-600 text-sm mt-2">{((data.totalUnidentified/data.totalPatients)*100).toFixed(1)}%</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Avg Serve Rate</div>
          <div className="text-3xl font-bold text-emerald-600">{data.avgServeRate}%</div>
          <div className="text-emerald-600 text-sm mt-2">Network Avg</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Avg No-Show</div>
          <div className="text-3xl font-bold text-red-600">{data.avgNoShowRate}%</div>
          <div className="text-red-600 text-sm mt-2">Network Avg</div>
        </div>

        <div className="kpi-card">
          <div className="text-gray-500 text-xs uppercase font-semibold mb-2">Active Branches</div>
          <div className="text-3xl font-bold text-cyan-600">{data.branches.length}</div>
          <div className="text-cyan-600 text-sm mt-2">Locations</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Network Trend */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={20} /> Network Weekly Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={networkTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="patients" fill="#a855f7" radius={[8, 8, 0, 0]} name="Total Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Comparison */}
        <div className="card-premium p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="text-cyan-600" size={20} /> Branch Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.branches}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="patients" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branches Table */}
      <div className="card-premium p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">All Branches</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Branch</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Patients</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Identified</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Serve Rate</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.branches.map((branch, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-semibold">{branch.name}</td>
                  <td className="py-3 px-4 text-gray-700">{branch.patients}</td>
                  <td className="py-3 px-4 text-gray-700">{branch.identified}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${branch.serveRate >= 99 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {branch.serveRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      ✓ Operational
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
