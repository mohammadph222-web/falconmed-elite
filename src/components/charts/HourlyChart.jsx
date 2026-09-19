// ═══════════════════════════════════════════════════════════
//  HourlyChart - Bar chart for hourly distribution
// ═══════════════════════════════════════════════════════════

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #475569',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
}

export default function HourlyChart({ hourly = [] }) {
  if (hourly.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
        No hourly data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={hourly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="patients" name="Patients" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
        <Bar dataKey="identified" name="Identified" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}