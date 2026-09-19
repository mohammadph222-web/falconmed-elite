import {
  Globe, Users, TrendingUp, AlertCircle, RefreshCw,
  CheckCircle2, Clock, Zap, Award, Building2, Download
} from 'lucide-react'
import { useNetworkStats } from '../hooks/useNetworkStats'
import { formatMinutes, formatNumber } from '../utils/formatters'
import BranchComparisonChart from '../components/charts/BranchComparisonChart'
import TrendLineChart from '../components/charts/TrendLineChart'

export default function AdminDashboard({ user }) {
  const { stats, branches, trends, staff, loading, error } = useNetworkStats()

  // ─── Loading ────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
        <p className="text-red-300 font-semibold mb-1">Failed to load network data</p>
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

  // ─── Derived ────────────────────────────────────────
  const topStaff = [...staff].sort((a, b) => b.total_patients - a.total_patients).slice(0, 10)
  const criticalBranches = branches.filter((b) => b.serve_rate < 80)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">🌐 Network Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.name || 'Administrator'} • Network Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300">Live Network</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 text-slate-300 text-xs font-medium transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && stats && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2 text-amber-200 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Grid - 6 cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            icon={<Globe size={20} />}
            label="Total Patients"
            value={formatNumber(stats.total_patients)}
            color="blue"
          />
          <KpiCard
            icon={<Building2 size={20} />}
            label="Active Branches"
            value={stats.active_branches}
            color="cyan"
          />
          <KpiCard
            icon={<Users size={20} />}
            label="Total Staff"
            value={stats.total_staff}
            color="purple"
          />
          <KpiCard
            icon={<CheckCircle2 size={20} />}
            label="Identified"
            value={`${stats.identified_percentage?.toFixed(1)}%`}
            color="emerald"
          />
          <KpiCard
            icon={<Clock size={20} />}
            label="Avg Wait"
            value={formatMinutes(stats.avg_waiting_time)}
            color="amber"
          />
          <KpiCard
            icon={<Award size={20} />}
            label="Serve Rate"
            value={`${stats.serve_rate?.toFixed(1)}%`}
            color="rose"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="📊 Branch Comparison" subtitle="Patients vs Identified">
          <BranchComparisonChart branches={branches} />
        </ChartCard>

        <ChartCard title="📈 Network Trends" subtitle="Patients & Identified over time">
          <TrendLineChart trends={trends} />
        </ChartCard>
      </div>

      {/* Branch Heatmap */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🗺️ Branch Health
          </h2>
          <span className="text-xs text-slate-400">{branches.length} branches</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {branches.map((b) => {
            const healthColor =
              b.serve_rate >= 90
                ? 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400'
                : b.serve_rate >= 75
                ? 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400'
                : 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400'

            return (
              <div
                key={b.id}
                className={`rounded-xl p-4 border bg-gradient-to-br ${healthColor} transition hover:scale-[1.02]`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-semibold uppercase opacity-80">
                    {b.name.replace(' Branch', '')}
                  </p>
                  <span className="text-lg">
                    {b.serve_rate >= 90 ? '🟢' : b.serve_rate >= 75 ? '🟡' : '🔴'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{b.total_patients}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {b.staff_count} staff • {b.serve_rate}% serve
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Row: Top Staff + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Staff */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-5 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🏆 Top 10 Staff Network-Wide
            </h2>
            <span className="text-xs text-slate-400">{staff.length} staff</span>
          </div>
          {topStaff.length > 0 ? (
            <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
              {topStaff.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-4 hover:bg-slate-700/30 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
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
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500">{s.branch_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-slate-500">Patients</p>
                      <p className="text-sm font-bold text-white">{s.total_patients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Avg</p>
                      <p className="text-sm font-bold text-cyan-400">
                        {formatMinutes(s.avg_service_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rating</p>
                      <p className="text-sm font-bold text-amber-400">
                        ⭐ {s.rating?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No staff data available
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-5 border-b border-slate-700/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🚨 Critical Alerts
              {criticalBranches.length > 0 && (
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                  {criticalBranches.length}
                </span>
              )}
            </h2>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {criticalBranches.length > 0 ? (
              criticalBranches.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-300">
                        {b.name}
                      </p>
                      <p className="text-xs text-red-200/80">
                        Serve rate low: {b.serve_rate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">All systems healthy</p>
                <p className="text-xs text-slate-500 mt-1">
                  No critical alerts
                </p>
              </div>
            )}

            {/* Additional insights */}
            {stats && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Network Insights
                </p>
                <InsightRow
                  icon={<TrendingUp size={14} />}
                  label="Identified Rate"
                  value={`${stats.identified_percentage?.toFixed(1)}%`}
                  color={stats.identified_percentage >= 90 ? 'emerald' : 'amber'}
                />
                <InsightRow
                  icon={<Zap size={14} />}
                  label="Serve Rate"
                  value={`${stats.serve_rate?.toFixed(1)}%`}
                  color={stats.serve_rate >= 90 ? 'emerald' : 'amber'}
                />
                <InsightRow
                  icon={<Clock size={14} />}
                  label="No Show Rate"
                  value={`${stats.no_show_rate?.toFixed(1)}%`}
                  color={stats.no_show_rate <= 5 ? 'emerald' : 'amber'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════

function KpiCard({ icon, label, value, color }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400',
  }

  return (
    <div className={`rounded-xl p-4 border bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">
          {label}
        </span>
        <div className="opacity-70">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
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

function InsightRow({ icon, label, value, color }) {
  const colors = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-slate-400 text-xs">
        {icon}
        {label}
      </span>
      <span className={`font-semibold ${colors[color]}`}>{value}</span>
    </div>
  )
}