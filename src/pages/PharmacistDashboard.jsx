import { useState } from 'react'
import {
  Phone, Clock, Users, TrendingUp, AlertCircle, RefreshCw,
  CheckCircle2, Timer, Bell, Play, CheckCheck, X
} from 'lucide-react'
import { useDashboardData } from '../hooks/useDashboardData'
import { useLivePatients } from '../hooks/useLivePatients'
import { useQueueActions } from '../hooks/useQueueActions'
import { formatMinutes, getWaitColor } from '../utils/formatters'
import { THRESHOLDS } from '../config/constants'

export default function PharmacistDashboard({ user }) {
  const userId = user?.id || 'ph_001'
  const { stats, loading, error, refetch } = useDashboardData(userId)
  const { patients: livePatients } = useLivePatients(5000)
  const { callPatient, finishPatient, loading: actionLoading } = useQueueActions()

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCall = async (patient) => {
    setActionError(null)
    try {
      await callPatient(patient.patient_id, userId)
      showToast(`📞 ${patient.patient_name} called!`)
      setSelectedPatient(null)
      refetch()
    } catch (err) {
      setActionError(err.message)
      showToast(`❌ ${err.message}`, 'error')
    }
  }

  const handleFinish = async (patient) => {
    setActionError(null)
    try {
      await finishPatient(patient.patient_id, userId)
      showToast(`✅ ${patient.patient_name} completed!`)
      setSelectedPatient(null)
      refetch()
    } catch (err) {
      setActionError(err.message)
      showToast(`❌ ${err.message}`, 'error')
    }
  }

  // ─── Loading State ────────────────────────────────────
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

  // ─── Error State ──────────────────────────────────────
  if (error && !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-300 font-semibold mb-1">Failed to load</p>
        <p className="text-red-200/80 text-sm mb-5">{error}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-medium"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  const waitingPatients = livePatients.filter((p) => p.status === 'waiting')
  const inServicePatients = livePatients.filter((p) => p.status === 'in_service')
  const identifiedRate = stats?.total_patients
    ? Math.round((stats.identified / stats.total_patients) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* ─── Toast ─────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-red-500/20 border-red-500/40 text-red-200'
          } animate-slide-down`}
        >
          {toast.msg}
        </div>
      )}

      {/* ─── Header ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">🏥 Pharmacist Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.name || 'Pharmacist'} • {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'short', day: 'numeric',
            })}
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-400">{stats.total_patients}</p>
              <p className="text-slate-400 text-xs">Today's Patients</p>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-400">{identifiedRate}%</p>
              <p className="text-slate-400 text-xs">Identified Rate</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Live Pulse ─────────────────────────── */}
      <div className="flex items-center gap-3 bg-slate-800/30 border border-slate-700/50 rounded-lg px-4 py-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm text-slate-300">Live Queue</span>
        <span className="text-xs text-slate-500 ml-auto">
          Auto-refresh every 5s • Last update {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* ─── KPI Grid ───────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Users size={22} />}
            label="Waiting"
            value={stats.waiting}
            unit="patients"
            color="amber"
            highlight={stats.waiting > 5}
          />
          <KpiCard
            icon={<Phone size={22} />}
            label="In Service"
            value={stats.in_service}
            unit="active"
            color="emerald"
          />
          <KpiCard
            icon={<Clock size={22} />}
            label="Avg Wait"
            value={formatMinutes(stats.avg_waiting_time)}
            color={stats.avg_waiting_time > THRESHOLDS.wait.danger ? 'red' : 'purple'}
          />
          <KpiCard
            icon={<TrendingUp size={22} />}
            label="Identified"
            value={stats.identified}
            unit="patients"
            color="blue"
          />
        </div>
      )}

      {/* ─── Two Columns: Waiting + In Service ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waiting */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Timer size={18} className="text-amber-400" /> Waiting
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                {waitingPatients.length}
              </span>
            </h2>
          </div>
          {waitingPatients.length > 0 ? (
            <div className="divide-y divide-slate-700/30 max-h-[500px] overflow-y-auto">
              {waitingPatients.map((p) => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  onCall={() => handleCall(p)}
                  onSelect={() => setSelectedPatient(p)}
                  actionLoading={actionLoading}
                  showCallButton
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="✨"
              title="No patients waiting"
              subtitle="All caught up!"
            />
          )}
        </div>

        {/* In Service */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" /> In Service
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                {inServicePatients.length}
              </span>
            </h2>
          </div>
          {inServicePatients.length > 0 ? (
            <div className="divide-y divide-slate-700/30 max-h-[500px] overflow-y-auto">
              {inServicePatients.map((p) => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  onFinish={() => handleFinish(p)}
                  onSelect={() => setSelectedPatient(p)}
                  actionLoading={actionLoading}
                  showFinishButton
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🎯"
              title="No patients in service"
              subtitle="Call the next patient to start"
            />
          )}
        </div>
      </div>

      {/* ─── Performance Summary ────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <PerformanceCard
            label="Identified Rate"
            value={`${identifiedRate}%`}
            subtitle={`${stats.identified} of ${stats.total_patients}`}
            color="blue"
            progress={identifiedRate}
          />
          <PerformanceCard
            label="Avg Service Time"
            value={formatMinutes(stats.avg_service_time)}
            subtitle="Per patient"
            color="emerald"
          />
          <PerformanceCard
            label="Quality Score"
            value={`${stats.rating?.toFixed(1) || '4.8'}/5`}
            subtitle="Patient rating"
            color="amber"
          />
        </div>
      )}

      {/* ─── Patient Detail Modal ───────────────── */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onCall={() => handleCall(selectedPatient)}
          onFinish={() => handleFinish(selectedPatient)}
          actionLoading={actionLoading}
          error={actionError}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════

function KpiCard({ icon, label, value, unit, color, highlight }) {
  const colors = {
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
  }

  return (
    <div
      className={`relative rounded-xl p-5 border bg-gradient-to-br ${colors[color]} ${
        highlight ? 'ring-2 ring-amber-500/50 animate-pulse-subtle' : ''
      }`}
    >
      {highlight && (
        <div className="absolute top-2 right-2">
          <Bell size={14} className="text-amber-400 animate-bounce" />
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
          {label}
        </span>
        <div className="opacity-70">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
    </div>
  )
}

function PatientRow({ patient, onCall, onFinish, onSelect, actionLoading, showCallButton, showFinishButton }) {
  const waitColor = getWaitColor(patient.waiting_time)

  return (
    <div className="p-4 hover:bg-slate-700/30 transition">
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1 cursor-pointer" onClick={onSelect}>
          <p className="font-semibold text-white truncate">{patient.patient_name}</p>
          <p className="text-xs text-slate-400">
            {patient.patient_id} • {patient.branch_name}
          </p>
        </div>
        <div className="text-right ml-3">
          <p className={`text-sm font-bold ${waitColor}`}>
            {formatMinutes(patient.waiting_time)}
          </p>
          {patient.identified && (
            <span className="text-xs text-emerald-400">✓ ID</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {showCallButton && (
          <button
            onClick={onCall}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Play size={14} /> Call Patient
          </button>
        )}
        {showFinishButton && (
          <button
            onClick={onFinish}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            <CheckCheck size={14} /> Complete
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="p-12 text-center">
      <div className="text-5xl mb-3 opacity-40">{icon}</div>
      <p className="text-slate-300 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function PerformanceCard({ label, value, subtitle, color, progress }) {
  const colors = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]} mb-1`}>{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

function PatientModal({ patient, onClose, onCall, onFinish, actionLoading, error }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{patient.patient_name}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {patient.patient_id} • {patient.branch_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <InfoRow label="Status" value={patient.status} />
          <InfoRow label="Service" value={patient.service_type} />
          <InfoRow label="Waiting" value={formatMinutes(patient.waiting_time)} />
          <InfoRow
            label="Identified"
            value={patient.identified ? '✅ Yes' : '❌ No'}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {patient.status === 'waiting' && (
              <button
                onClick={onCall}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                <Play size={16} /> Call Patient
              </button>
            )}
            {patient.status === 'in_service' && (
              <button
                onClick={onFinish}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                <CheckCheck size={16} /> Complete Service
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  )
}