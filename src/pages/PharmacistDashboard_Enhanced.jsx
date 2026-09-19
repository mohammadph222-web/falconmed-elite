import { useState } from 'react'
import {
  Phone, Clock, Users, TrendingUp, AlertCircle,
  RefreshCw, CheckCircle2, Timer
} from 'lucide-react'
import { useDashboardData } from '../hooks/useDashboardData'
import { useLivePatients } from '../hooks/useLivePatients'
import { API_BASE } from '../config/api'

export default function PharmacistDashboard_Enhanced({ user }) {
  const userId = user?.id || 'ph_001'
  const { stats, loading, error, refetch } = useDashboardData(userId)
  const { patients: livePatients } = useLivePatients(5000)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState(null)

  // ─── Patient Actions ────────────────────────────────────
  const callPatient = async (patient) => {
    setActionLoading(patient.id)
    setActionError(null)
    try {
      const res = await fetch(`${API_BASE}/queue/patient-called`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.patient_id,
          pharmacist_id: userId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed')
      setSelectedPatient(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const finishPatient = async (patient) => {
    setActionLoading(patient.id)
    setActionError(null)
    try {
      const res = await fetch(`${API_BASE}/queue/patient-finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.patient_id,
          pharmacist_id: userId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed')
      setSelectedPatient(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── Loading ────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // ─── Error ──────────────────────────────────────────────
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

  // ─── Derived ────────────────────────────────────────────
  const waitingPatients = livePatients.filter(p => p.status === 'waiting')
  const inServicePatients = livePatients.filter(p => p.status === 'in_service')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">🏥 Pharmacist Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.name || 'Pharmacist'} • Real-time Queue
          </p>
        </div>
        {stats && (
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-400">{stats.total_patients}</p>
            <p className="text-slate-400 text-sm">Total Patients</p>
          </div>
        )}
      </div>

      {/* Soft error */}
      {error && stats && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-amber-200 text-sm">{error}</p>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-200 text-sm">{actionError}</p>
        </div>
      )}

      {/* KPI Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users size={22} />} label="Waiting" value={stats.waiting} color="amber" />
          <StatCard icon={<Phone size={22} />} label="In Service" value={stats.in_service} color="emerald" />
          <StatCard icon={<Clock size={22} />} label="Avg Wait" value={`${Math.round(stats.avg_waiting_time)}m`} color="purple" />
          <StatCard icon={<TrendingUp size={22} />} label="Identified" value={stats.identified} color="blue" />
        </div>
      )}

      {/* Two Columns: Waiting + In Service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waiting */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Timer size={18} className="text-amber-400" /> Waiting ({waitingPatients.length})
            </h2>
          </div>
          {waitingPatients.length > 0 ? (
            <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
              {waitingPatients.map((p) => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  onClick={() => setSelectedPatient(p)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">No patients waiting</div>
          )}
        </div>

        {/* In Service */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" /> In Service ({inServicePatients.length})
            </h2>
          </div>
          {inServicePatients.length > 0 ? (
            <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
              {inServicePatients.map((p) => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  onClick={() => setSelectedPatient(p)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">No patients in service</div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 rounded-xl p-6 border border-blue-500/20">
            <p className="text-slate-400 text-sm font-semibold uppercase">Identified Rate</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {stats.total_patients > 0
                ? Math.round((stats.identified / stats.total_patients) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 rounded-xl p-6 border border-emerald-500/20">
            <p className="text-slate-400 text-sm font-semibold uppercase">Avg Service</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              {stats.avg_service_time.toFixed(1)} min
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Patient Details</h3>
            <div className="space-y-3 text-sm">
              <Row label="ID" value={selectedPatient.patient_id} />
              <Row label="Name" value={selectedPatient.patient_name} />
              <Row label="Branch" value={selectedPatient.branch_name} />
              <Row label="Status" value={selectedPatient.status} />
              <Row label="Service" value={selectedPatient.service_type} />
              <Row label="Waiting" value={`${selectedPatient.waiting_time} min`} />
              <Row label="Identified" value={selectedPatient.identified ? '✅ Yes' : '❌ No'} />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              {selectedPatient.status === 'waiting' && (
                <button
                  onClick={() => callPatient(selectedPatient)}
                  disabled={actionLoading === selectedPatient.id}
                  className="col-span-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {actionLoading === selectedPatient.id ? 'Calling...' : '📞 Call Patient'}
                </button>
              )}
              {selectedPatient.status === 'in_service' && (
                <button
                  onClick={() => finishPatient(selectedPatient)}
                  disabled={actionLoading === selectedPatient.id}
                  className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {actionLoading === selectedPatient.id ? 'Finishing...' : '✅ Complete Service'}
                </button>
              )}
              <button
                onClick={() => setSelectedPatient(null)}
                className="col-span-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  const colors = {
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
  }
  return (
    <div className={`rounded-xl p-5 border bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        <div className="opacity-60">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value ?? 0}</p>
    </div>
  )
}

function PatientRow({ patient, onClick }) {
  const waitColor = patient.waiting_time > 30
    ? 'text-red-400'
    : patient.waiting_time > 15
    ? 'text-amber-400'
    : 'text-slate-400'

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-slate-700/30 cursor-pointer transition"
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">
            {patient.patient_name}
          </p>
          <p className="text-sm text-slate-400">
            {patient.patient_id} • {patient.branch_name}
          </p>
        </div>
        <div className="text-right ml-3">
          <p className={`text-sm font-semibold ${waitColor}`}>
            {patient.waiting_time}m
          </p>
          {patient.identified && (
            <span className="text-xs text-emerald-400">✓ ID</span>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}:</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}