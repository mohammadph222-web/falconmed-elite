import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, RotateCcw, Download } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import LivePatients from '../components/LivePatients'

// ═══════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════

// ✅ إصلاح: استخدم /api في النهاية لتتطابق مع dashboardApi.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://falconmed-backend.onrender.com/api'

const SERVICE_TIME_TARGET = 20  // minutes (100% at 0, 0% at 20)
const WAIT_TIME_TARGET = 5      // minutes
const AUTO_REFRESH_MS = 30_000  // 30 seconds

const CHART_COLORS = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  warning: '#f59e0b',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid rgba(51, 65, 85, 0.5)',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#e2e8f0',
}

// ═══════════════════════════════════════════════════════════
//  Utilities
// ═══════════════════════════════════════════════════════════

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value))

const toSafeNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

const formatMinutes = (value) => {
  const v = Number(value)
  if (!Number.isFinite(v) || v < 0) return '0.0'
  if (v < 60) return v.toFixed(1)
  const h = Math.floor(v / 60)
  const m = (v % 60).toFixed(0)
  return `${h}h ${m}m`
}

// ═══════════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════════

export default function PharmacistDashboard({ user }) {
  // ─── Filters ───────────────────────────────────────────
  const todayISO = new Date().toISOString().slice(0, 10)
  const [fromDate, setFromDate] = useState(todayISO)
  const [toDate, setToDate] = useState(todayISO)
  const [appliedFilters, setAppliedFilters] = useState({ from: todayISO, to: todayISO })

  // ─── State ─────────────────────────────────────────────
  const [data, setData] = useState(null)
  const [hourlyData, setHourlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // ─── Refs ──────────────────────────────────────────────
  const requestIdRef = useRef(0)
  const abortControllerRef = useRef(null)
  const isMountedRef = useRef(true)

  // ═════════════════════════════════════════════════════════
  //  Fetch Logic
  // ═════════════════════════════════════════════════════════

  const fetchDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestIdRef.current

      // Cancel previous request
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller
      const { signal } = controller

      if (!silent) setLoading(true)
      else setRefreshing(true)

      try {
        const params = new URLSearchParams({
          from: appliedFilters.from,
          to: appliedFilters.to,
        })

        const hourlyUserId = user?.id ?? 1

        // ✅ استخدم API_BASE بدل API_URL (جاهزة معها /api)
        // Parallel requests that don't kill each other
        const [statsSettled, hourlySettled] = await Promise.allSettled([
          fetch(`${API_BASE}/queue/stats?${params}`, { signal }),
          fetch(`${API_BASE}/dashboard/hourly/${hourlyUserId}?${params}`, { signal }),
        ])

        if (requestId !== requestIdRef.current || !isMountedRef.current) return

        // Stats failure = real error
        if (statsSettled.status === 'rejected') {
          if (statsSettled.reason?.name === 'AbortError') return
          throw new Error(statsSettled.reason?.message || 'Failed to connect to server')
        }

        const statsRes = statsSettled.value
        if (!statsRes.ok) throw new Error(`HTTP ${statsRes.status}`)

        const result = await statsRes.json()
        if (requestId !== requestIdRef.current) return
        if (!result.success) throw new Error(result.message || 'Failed to fetch data')

        // ─── Normalize stats ───
        const d = result.data || {}
        const normalized = {
          total_patients: toSafeNumber(d.total_patients),
          identified: toSafeNumber(d.identified),
          unidentified: toSafeNumber(d.unidentified),
          completed: toSafeNumber(d.completed ?? d.total_patients),
          avg_service_time: toSafeNumber(d.avg_service_time),
          avg_waiting_time: toSafeNumber(d.avg_waiting_time),
          in_service: toSafeNumber(d.in_service),
          waiting: toSafeNumber(d.waiting),
          trends: d.trends ?? null,
        }

        // ─── Normalize hourly ───
        let hourly = []
        if (hourlySettled.status === 'fulfilled' && hourlySettled.value?.ok) {
          try {
            const hourlyResult = await hourlySettled.value.json()
            if (hourlyResult.success && Array.isArray(hourlyResult.data)) {
              hourly = hourlyResult.data
            }
          } catch {
            /* ignore JSON parse errors */
          }
        }

        if (requestId !== requestIdRef.current) return

        setData(normalized)
        setHourlyData(hourly)
        setLastUpdated(new Date())
        setError(null)
      } catch (err) {
        if (err.name === 'AbortError') return
        if (requestId !== requestIdRef.current || !isMountedRef.current) return

        setError(err.message || 'An unexpected error occurred')
        setHourlyData([])
      } finally {
        if (requestId === requestIdRef.current && isMountedRef.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [appliedFilters, user?.id]
  )

  // ─── Mount + Applied Filters Change ────────────────────
  useEffect(() => {
    isMountedRef.current = true
    fetchDashboardData()

    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [fetchDashboardData])

  // ─── Auto Refresh (paused when tab hidden) ─────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData({ silent: true })
      }
    }, AUTO_REFRESH_MS)

    return () => clearInterval(interval)
  }, [fetchDashboardData])

  // ═════════════════════════════════════════════════════════
  //  Derived Data
  // ═════════════════════════════════════════════════════════

  const identifiedPercentage = useMemo(() => {
    if (!data?.total_patients) return 0
    return (data.identified / data.total_patients) * 100
  }, [data])

  const serviceScore = useMemo(() => {
    if (!data || data.total_patients === 0 || data.avg_service_time <= 0) return null
    return clamp(100 - (data.avg_service_time / SERVICE_TIME_TARGET) * 100)
  }, [data])

  const waitScore = useMemo(() => {
    if (!data || data.total_patients === 0) return null
    return clamp(100 - (data.avg_waiting_time / WAIT_TIME_TARGET) * 100)
  }, [data])

  const accuracyScore = useMemo(() => {
    if (!data || data.total_patients === 0) return null
    return clamp((data.identified / data.total_patients) * 100)
  }, [data])

  const efficiencyScore = useMemo(() => {
    if (!data || data.total_patients === 0) return null
    return clamp(100 - (data.waiting / Math.max(1, data.total_patients)) * 100)
  }, [data])

  const performanceScore = useMemo(() => {
    const scores = [serviceScore, waitScore, accuracyScore, efficiencyScore].filter(
      (s) => s !== null
    )
    if (!scores.length) return '—'
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  }, [serviceScore, waitScore, accuracyScore, efficiencyScore])

  const performanceMetrics = useMemo(() => {
    const metrics = [
      { label: 'Speed', value: serviceScore, color: 'from-blue-500 to-cyan-500' },
      { label: 'Accuracy', value: accuracyScore, color: 'from-emerald-500 to-teal-500' },
      { label: 'Efficiency', value: efficiencyScore, color: 'from-green-500 to-emerald-500' },
      { label: 'Quality', value: waitScore, color: 'from-purple-500 to-pink-500' },
    ]

    return metrics.map((m) => ({
      ...m,
      displayValue: m.value === null ? '—' : m.value.toFixed(1),
      barWidth: m.value === null ? 0 : m.value,
    }))
  }, [serviceScore, accuracyScore, efficiencyScore, waitScore])

  const patientsData = useMemo(() => {
    if (!data) return []
    const items = [
      { name: 'Completed', value: data.completed, fill: CHART_COLORS.primary },
      { name: 'In Service', value: data.in_service, fill: CHART_COLORS.secondary },
      { name: 'Waiting', value: data.waiting, fill: CHART_COLORS.warning },
    ]
    return items.filter((item) => item.value > 0)
  }, [data])

  // ═════════════════════════════════════════════════════════
  //  Handlers
  // ═════════════════════════════════════════════════════════

  const handleApplyFilters = () => {
    if (new Date(fromDate) > new Date(toDate)) {
      setError('Start date must be before end date')
      return
    }

    setError(null)

    const unchanged =
      fromDate === appliedFilters.from && toDate === appliedFilters.to

    if (unchanged) {
      fetchDashboardData()
    } else {
      setAppliedFilters({ from: fromDate, to: toDate })
    }
  }

  const handleRetry = () => {
    setError(null)
    fetchDashboardData()
  }

  const handleQuickRange = (days) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)

    const fromISO = from.toISOString().slice(0, 10)
    const toISO = to.toISOString().slice(0, 10)

    setFromDate(fromISO)
    setToDate(toISO)
    setAppliedFilters({ from: fromISO, to: toISO })
  }

  const handleExport = () => {
    if (!data) {
      setError('No data available to export')
      return
    }

    const rows = [
      ['Metric', 'Value'],
      ['Period From', appliedFilters.from],
      ['Period To', appliedFilters.to],
      ['Total Patients Served', data.total_patients],
      ['Identified', data.identified],
      ['Unidentified', data.unidentified],
      ['In Service', data.in_service],
      ['Waiting', data.waiting],
      ['Avg Service Time (min)', data.avg_service_time.toFixed(2)],
      ['Avg Waiting Time (min)', data.avg_waiting_time.toFixed(2)],
      ['Performance Score', performanceScore],
      ['Exported At', new Date().toISOString()],
    ]

    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `pharmacist-dashboard_${appliedFilters.from}_to_${appliedFilters.to}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ═════════════════════════════════════════════════════════
  //  Render States
  // ═════════════════════════════════════════════════════════

  // ✅ إصلاح: استخدم `loading && !data` بدل `loading && !performanceMetrics.length`
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-300 font-semibold mb-1">Failed to load dashboard</p>
        <p className="text-red-200/80 text-sm mb-5">{error}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-medium transition-colors"
        >
          <RotateCcw size={16} />
          Retry
        </button>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════
  //  Main Render
  // ═════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ─────────── Header ─────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacist Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Personal Performance Analytics</p>
        </div>

        <div className="flex items-center gap-2">
          {refreshing && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-slate-500 border-t-blue-400 animate-spin" />
              Refreshing...
            </span>
          )}

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-100 text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ─────────── Soft Error Banner ─────────── */}
      {error && data && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between gap-3 text-amber-200 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRetry}
            className="text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─────────── Filters ─────────── */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3">
        {/* Quick ranges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick range:</span>
          {[
            { label: 'Today', days: 0 },
            { label: 'Last 7 days', days: 6 },
            { label: 'Last 30 days', days: 29 },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => handleQuickRange(r.days)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/40 hover:bg-slate-700/70 text-slate-300 border border-transparent transition-colors"
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Date inputs */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="from-date" className="block text-xs text-slate-400 font-medium mb-1.5">
              From Date
            </label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label htmlFor="to-date" className="block text-xs text-slate-400 font-medium mb-1.5">
              To Date
            </label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            Apply Filters
          </button>
        </div>

        {lastUpdated && (
          <p className="text-slate-500 text-xs">
            ✓ Last updated: {lastUpdated.toLocaleTimeString('en-US')} • Auto-refresh every 30s
          </p>
        )}
      </div>

      {/* ─────────── Live Patients ─────────── */}
      <LivePatients />

      {/* ─────────── KPI Cards ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon="👥"
          label="Patients Served"
          value={data?.total_patients ?? 0}
          unit="patients"
          trend={data?.trends?.total_patients}
          accent="blue"
        />
        <KpiCard
          icon="✓"
          label="Identified"
          value={data?.identified ?? 0}
          hint={`${identifiedPercentage.toFixed(1)}% of total`}
          trend={data?.trends?.identified}
          accent="emerald"
        />
        <KpiCard
          icon="⏱️"
          label="Avg Service Time"
          value={formatMinutes(data?.avg_service_time)}
          unit="min"
          trend={data?.trends?.avg_service_time}
          accent="cyan"
        />
        <KpiCard
          icon="⏳"
          label="Avg Waiting Time"
          value={formatMinutes(data?.avg_waiting_time)}
          unit="min"
          hint={data?.waiting > 0 ? `${data.waiting} currently waiting` : undefined}
          trend={data?.trends?.avg_waiting_time}
          accent="amber"
        />
      </div>

      {/* ─────────── Charts: Hourly + Performance ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Hourly Distribution">
          {loading && !data ? (
            <SkeletonChart />
          ) : hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="Patients"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#gradArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No hourly data available for this period" />
          )}
        </ChartCard>

        <ChartCard
          title="Performance Score"
          action={
            <span className="text-4xl font-bold text-cyan-400 tabular-nums">
              {performanceScore}
            </span>
          }
        >
          {loading && !data ? (
            <SkeletonChart />
          ) : performanceMetrics.some((m) => m.value !== null) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [value === null ? '—' : `${value.toFixed(1)}%`, 'Score']}
                />
                <Bar dataKey="barWidth" name="Score" fill={CHART_COLORS.secondary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Not enough data available" />
          )}
        </ChartCard>
      </div>

      {/* ─────────── Patient Status + Quality ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Patient Status">
          {loading && !data ? (
            <SkeletonChart />
          ) : patientsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={patientsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {patientsData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No data available" />
          )}
        </ChartCard>

        <ChartCard title="Service Quality">
          <div className="space-y-4">
            {performanceMetrics.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                  <p className="text-lg font-bold text-cyan-400 tabular-nums">
                    {item.displayValue === '—' ? '—' : `${item.displayValue}%`}
                  </p>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.barWidth}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════

function KpiCard({ icon, label, value, unit, trend, hint, accent = 'blue' }) {
  const accentMap = {
    blue: 'from-blue-500/20 to-blue-600/5 text-blue-400',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400',
  }

  const hasTrend = trend != null && Number.isFinite(trend)
  const trendColor = !hasTrend
    ? 'text-slate-400 bg-slate-500/10'
    : trend > 0
    ? 'text-emerald-400 bg-emerald-500/10'
    : trend < 0
    ? 'text-red-400 bg-red-500/10'
    : 'text-slate-400 bg-slate-500/10'

  const TrendIcon = !hasTrend
    ? null
    : trend > 0
    ? TrendingUp
    : trend < 0
    ? TrendingDown
    : null

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center bg-gradient-to-br ${accentMap[accent]} border border-slate-700/30`}
        >
          <span className="text-lg" aria-hidden>
            {icon}
          </span>
        </div>

        {hasTrend && trend !== 0 && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${trendColor}`}
          >
            {TrendIcon && <TrendIcon size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 mb-2">
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
      </div>
      {hint && <p className="text-slate-500 text-xs">{hint}</p>}
    </div>
  )
}

function ChartCard({ title, action, children }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-100 font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function SkeletonChart() {
  return <div className="h-[300px] bg-slate-700/20 animate-pulse rounded-lg" />
}

function EmptyChart({ message }) {
  return (
    <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
      {message}
    </div>
  )
}
