import { useState, useEffect } from 'react'
import {
  Plus, Send, RefreshCw, CheckCircle, AlertCircle,
  Zap, Users, Timer, TrendingUp, Activity
} from 'lucide-react'
import { API_BASE } from '../config/api'
import { BRANCHES, SERVICE_TYPES } from '../config/constants'
import { formatMinutes, formatNumber } from '../utils/formatters'

export default function QueueMachineSimulator() {
  const [patientData, setPatientData] = useState({
    patient_id: '',
    patient_name: '',
    branch_id: 1,
    service_type: 'pharmacy',
  })

  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)

  // ─── Fetch Stats ────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/queue/stats?userId=ph_001`)
        const data = await res.json()
        if (mounted && data.success) setStats(data.data)
      } catch (err) {
        console.error('Stats error:', err)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // ─── Handlers ────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPatientData((prev) => ({
      ...prev,
      [name]: name === 'branch_id' ? parseInt(value, 10) : value,
    }))
  }

  const registerPatient = async (patient) => {
  const identified = patient.identified !== undefined 
    ? patient.identified 
    : Math.random() > 0.3

  const res = await fetch(`${API_BASE}/queue/patient-arrival`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...patient, identified }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Failed')
  return data
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientData.patient_id || !patientData.patient_name) {
      setMessage('❌ Please fill in all fields')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      await registerPatient(patientData)
      setMessage(`✅ Registered: ${patientData.patient_name}`)
      setMessageType('success')

      setHistory((prev) => [
        {
          id: patientData.patient_id,
          name: patientData.patient_name,
          branch: BRANCHES.find((b) => b.id === patientData.branch_id)?.name,
          service: patientData.service_type,
          timestamp: new Date().toLocaleTimeString(),
          status: 'Registered',
        },
        ...prev,
      ])

      setPatientData({
        patient_id: '',
        patient_name: '',
        branch_id: 1,
        service_type: 'pharmacy',
      })
    } catch (err) {
      setMessage(`❌ ${err.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // ─── Bulk Add ───────────────────────────────────────────
  const handleBulkAdd = async (count = 5) => {
    if (!confirm(`Register ${count} random patients?`)) return
    setBulkLoading(true)
    setMessage('')

    const firstNames = ['Ahmed', 'Sara', 'Mohammed', 'Fatima', 'Omar', 'Layla', 'Khalid', 'Noor', 'Zain', 'Hana']
    const lastNames = ['Ali', 'Mohamed', 'Hassan', 'Khaled', 'Ahmed', 'Saeed', 'Ibrahim', 'Yousef']

    let successCount = 0
    const bulkHistory = []

    for (let i = 0; i < count; i++) {
      const patientId = `AUTO-${Date.now()}-${i}`
      const patientName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
      const branchId = Math.floor(Math.random() * 3) + 1
      const serviceType = SERVICE_TYPES[Math.floor(Math.random() * SERVICE_TYPES.length)].value

      try {
        await registerPatient({
          patient_id: patientId,
          patient_name: patientName,
          branch_id: branchId,
          service_type: serviceType,
        })
        successCount++
        bulkHistory.push({
          id: patientId,
          name: patientName,
          branch: BRANCHES.find((b) => b.id === branchId)?.name,
          service: serviceType,
          timestamp: new Date().toLocaleTimeString(),
          status: 'Auto',
        })
      } catch (err) {
        console.error('Bulk error:', err)
      }

      await new Promise((r) => setTimeout(r, 100))
    }

    setHistory((prev) => [...bulkHistory, ...prev])
    setMessage(`✅ Added ${successCount}/${count} patients`)
    setMessageType(successCount === count ? 'success' : 'error')
    setBulkLoading(false)
  }

  const handleQuickFill = () => {
    const randomId = `P${Math.floor(Math.random() * 10000)}`
    const names = ['أحمد علي', 'فاطمة محمد', 'محمد حسن', 'سارة خالد', 'علي محمود', 'نور الدين']
    setPatientData({
      patient_id: randomId,
      patient_name: names[Math.floor(Math.random() * names.length)],
      branch_id: Math.floor(Math.random() * 3) + 1,
      service_type: 'pharmacy',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
              🖥️
            </div>
            <h1 className="text-4xl font-bold text-white">Queue Machine Simulator</h1>
          </div>
          <p className="text-slate-400">نظام توليد مرضى لاختبار النظام في الوقت الفعلي</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-400" /> Register Patient
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Patient ID</label>
                  <input
                    type="text"
                    name="patient_id"
                    value={patientData.patient_id}
                    onChange={handleInputChange}
                    placeholder="P001"
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Patient Name</label>
                  <input
                    type="text"
                    name="patient_name"
                    value={patientData.patient_name}
                    onChange={handleInputChange}
                    placeholder="أحمد علي"
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Branch</label>
                  <select
                    name="branch_id"
                    value={patientData.branch_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Service Type</label>
                  <select
                    name="service_type"
                    value={patientData.service_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {message && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      messageType === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {messageType === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {message}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={14} />
                    {loading ? 'Sending...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    disabled={loading}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 rounded-lg text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw size={14} />
                    Fill Random
                  </button>
                </div>
              </form>
            </div>

            {/* Bulk Actions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-amber-400" /> Bulk Generate
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                سجّل مرضى بسرعة لاختبار النظام
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleBulkAdd(5)}
                  disabled={bulkLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {bulkLoading ? '...' : '+5 patients'}
                </button>
                <button
                  onClick={() => handleBulkAdd(10)}
                  disabled={bulkLoading}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {bulkLoading ? '...' : '+10 patients'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-200">
              <p className="font-semibold mb-2">💡 How to Test:</p>
              <ol className="space-y-1 text-xs text-blue-300/80">
                <li>1. سجّل مريض جديد أو استخدم Bulk</li>
                <li>2. افتح Pharmacist Dashboard في تاب آخر</li>
                <li>3. شاهد المرضى يظهرون فوراً</li>
                <li>4. جرب Call/Complete من الداشبورد</li>
              </ol>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {stats && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="text-emerald-400" /> Live Statistics
                  </h2>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatBox icon={<Users size={16} />} label="Total Patients" value={formatNumber(stats.total_patients)} color="blue" />
                  <StatBox icon={<Timer size={16} />} label="Waiting" value={formatNumber(stats.waiting)} color="amber" />
                  <StatBox icon={<Activity size={16} />} label="In Service" value={formatNumber(stats.in_service)} color="emerald" />
                  <StatBox icon={<CheckCircle size={16} />} label="Identified" value={formatNumber(stats.identified)} color="cyan" />
                  <StatBox icon={<Timer size={16} />} label="Avg Wait" value={formatMinutes(stats.avg_waiting_time)} color="purple" />
                  <StatBox icon={<TrendingUp size={16} />} label="Avg Service" value={formatMinutes(stats.avg_service_time)} color="indigo" />
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={20} className="text-blue-400" /> Registration History
                </h2>
                <span className="text-xs text-slate-400">{history.length} recent</span>
              </div>

              {history.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4 opacity-30">📋</div>
                  <p className="text-slate-400">No patients registered yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    ابدأ بتسجيل مريض أو استخدم Bulk Generate
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
                  {history.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 hover:bg-slate-700/30 transition flex justify-between items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white text-sm truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {p.id} • {p.branch} • {p.service}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-xs font-semibold text-emerald-400">{p.status}</p>
                        <p className="text-xs text-slate-500">{p.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ icon, label, value, color }) {
  const colors = {
    blue: 'text-blue-400 border-blue-500/30',
    amber: 'text-amber-400 border-amber-500/30',
    emerald: 'text-emerald-400 border-emerald-500/30',
    cyan: 'text-cyan-400 border-cyan-500/30',
    purple: 'text-purple-400 border-purple-500/30',
    indigo: 'text-indigo-400 border-indigo-500/30',
  }

  return (
    <div className={`bg-slate-900/40 border ${colors[color]} rounded-lg p-3`}>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colors[color].split(' ')[0]}`}>{value}</p>
    </div>
  )
}