import {
  Users, CheckCircle2, Clock, AlertCircle, RefreshCw,
  TrendingUp, Award, Building2, Phone
} from 'lucide-react'
import { useBranchStats } from '../hooks/useBranchStats'
import { useLivePatients } from '../hooks/useLivePatients'
import { formatMinutes, formatNumber } from '../utils/formatters'
import HourlyChart from '../components/charts/HourlyChart'

export default function ManagerDashboard({ user }) {
  const branchId = user?.branchId || '1'
  const { stats, performers, hourly, loading, error } = useBranchStats(branchId)
  const { patients: livePatients } = useLivePatients(5000)

  // Filter patients for this branch
  const branchPatients = livePatients.filter(
    (p) => String(p.branch_id) === String(branchId) || p.branch_id === Number(branchId)
  )
  const waiting = branchPatients.filter((p) => p.status === 'waiting').length
  const inService = branchPatients.filter((p) => p.status === 'in_service').length

  // ─── Loading ────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Error ──────────────────────────────────────────
  if (error && !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-300 font-semibold mb-1">Failed to load branch data</p>
        <p className="text-red-200/80 text-sm mb-5">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-medium"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">👔 Branch Manager Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.name || 'Manager'} • {user?.branch || `Branch ${branchId}`}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300">Live</span>
        </div>
      </div>

      {/* KPI Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Users size={22} />}
            label="Total Patients"
            value={formatNumber(stats.total_patients)}
            color="blue"
          />
          <KpiCard
            icon={<Clock size={22} />}
            label="Waiting"
            value={waiting}
            color="amber"
          />
          <KpiCard
            icon={<Phone size={22} />}
            label="In Service"
            value={inService}
            color="emerald"
          />
          <KpiCard
            icon={<Award size={22} />}
            label="Identified"
            value={`${stats.identified_percentage?.toFixed(1)}%`}
            color="purple"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="📊 Hourly Distribution" subtitle="Patients per hour">
          <HourlyChart hourly={hourly} />
        </ChartCard>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-base font-bold text-white mb-4">📈 Performance Summary</h3>
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <StatBox
                label="Avg Wait"
                value={formatMinutes(stats.avg_waiting_time)}
                color="amber"
              />
              <StatBox
                label="Avg Service"
                value={formatMinutes(stats.avg_service_time)}
                color="emerald"
              />
              <StatBox
                label="Staff Count"
                value={stats.staff_count}
                color="blue"
              />
              <StatBox
                label="Serve Rate"
                value={`${stats.serve_rate?.toFixed(1)}%`}
                color="purple"
              />
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
        <div className="p-5 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🏆 Top Performers
          </h2>
          <span className="text-xs text-slate-400">{performers.length} staff</span>
        </div>

        {performers.length > 0 ? (
          <div className="divide-y divide-slate-700/30">
            {performers.map((p, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-slate-700/30 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? 'bg-amber-500/30 text-amber-300'
                        : idx === 1
                        ? 'bg-slate-400/30 text-slate-300'
                        : idx === 2
                        ? 'bg-orange-700/30 text-orange-300'
                        : 'bg-slate-700/50 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm truncate">
                      {p.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-slate-500">Patients</p>
                    <p className="text-sm font-bold text-white">{p.patients_served}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Avg</p>
                    <p className="text-sm font-bold text-cyan-400">
                      {formatMinutes(p.avg_service_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Rating</p>
                    <p className="text-sm font-bold text-amber-400">
                      ⭐ {p.rating?.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No performer data available
          </div>
        )}
      </div>

      {/* Live Patients in Branch */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
        <div className="p-5 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            📋 Branch Queue ({branchPatients.length})
          </h2>
        </div>
        {branchPatients.length > 0 ? (
          <div className="divide-y divide-slate-700/30 max-h-80 overflow-y-auto">
            {branchPatients.slice(0, 20).map((p) => (
              <div
                key={p.id}
                className="p-4 hover:bg-slate-700/30 transition flex justify-between items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white text-sm truncate">
                    {p.patient_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.patient_id} • {p.branch_name}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'waiting'
                      ? 'bg-amber-500/20 text-amber-300'
                      : p.status === 'in_service'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No patients in this branch
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────

function KpiCard({ icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  }

  return (
    <div className={`rounded-xl p-5 border bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
          {label}
        </span>
        <div className="opacity-70">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function StatBox({ label, value, color }) {
  const colors = {
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="bg-slate-900/40 rounded-lg p-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}