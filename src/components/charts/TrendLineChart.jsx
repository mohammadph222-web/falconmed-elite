// ═══════════════════════════════════════════════════════════
//  TrendLineChart - Line chart for network trends
// ═══════════════════════════════════════════════════════════

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #475569',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
}

export default function TrendLineChart({ trends = [] }) {
  if (trends.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
        No trend data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
        />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="patients"
          name="Patients"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0ea5e9' }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="identified"
          name="Identified"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4, fill: '#10b981' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}