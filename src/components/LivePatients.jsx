import { useState, useEffect, useCallback, useRef } from 'react'
import { Phone, CheckCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react'

export default function LivePatients() {
  const [waitingPatients, setWaitingPatients] = useState([])
  const [inServicePatients, setInServicePatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [message, setMessage] = useState({ text: '', type: '' })
  const refreshIntervalRef = useRef(null)

  // Fetch patients - الدالة الأساسية
  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch(
        'https://falconmed-backend.onrender.com/api/queue/live-patients'
      )
      const data = await response.json()
      
      if (data.success) {
        // Filter waiting patients (no called_time)
        const waiting = data.data.filter(p => !p.called_time)
        setWaitingPatients(waiting)
        
        // Filter in-service patients (have called_time but no finish_time)
        const inService = data.data.filter(p => p.called_time && !p.finish_time)
        setInServicePatients(inService)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize - تحديث كل 2 ثانية (Real-time)
  useEffect(() => {
    fetchPatients()
    
    // Real-time polling every 2 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchPatients()
    }, 2000)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [fetchPatients])

  // Show message - مؤقت
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  // Call patient
  const handleCallPatient = async (patientId, patientName) => {
    setActionLoading(prev => ({ ...prev, [patientId]: true }))
    
    try {
      const response = await fetch(
        'https://falconmed-backend.onrender.com/api/queue/patient-called',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: patientId })
        }
      )
      
      const data = await response.json()
      
      if (data.success) {
        showMessage(`📞 ${patientName} called!`, 'success')
        // Remove from waiting
        setWaitingPatients(prev => prev.filter(p => p.patient_id !== patientId))
        // Refetch to get updated data
        setTimeout(() => fetchPatients(), 500)
      } else {
        showMessage(`Error: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage('Connection error', 'error')
      console.error('Error:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [patientId]: false }))
    }
  }

  // Finish patient
  const handleFinishPatient = async (patientId, patientName) => {
    setActionLoading(prev => ({ ...prev, [`finish-${patientId}`]: true }))
    
    try {
      const response = await fetch(
        'https://falconmed-backend.onrender.com/api/queue/patient-finish',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: patientId })
        }
      )
      
      const data = await response.json()
      
      if (data.success) {
        showMessage(`✅ ${patientName} finished!`, 'success')
        // Remove from in-service
        setInServicePatients(prev => prev.filter(p => p.patient_id !== patientId))
        // Refetch
        setTimeout(() => fetchPatients(), 500)
      } else {
        showMessage(`Error: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage('Connection error', 'error')
      console.error('Error:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [`finish-${patientId}`]: false }))
    }
  }

  const totalPatients = waitingPatients.length + inServicePatients.length

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-50">👥 Live Queue</h2>
          <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-xs font-bold">
            🔴 LIVE
          </span>
        </div>
        <button
          onClick={() => fetchPatients()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-900/30 border border-green-500 text-green-400' 
            : 'bg-red-900/30 border border-red-500 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Loading State */}
      {loading && totalPatients === 0 && (
        <div className="text-center py-8">
          <Loader className="animate-spin mx-auto mb-2 text-blue-400" size={32} />
          <p className="text-slate-400">Loading patients...</p>
        </div>
      )}

      {/* No Patients */}
      {!loading && totalPatients === 0 && (
        <div className="text-center py-12 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600">
          <p className="text-slate-300 text-lg font-semibold">✨ Queue Clear!</p>
          <p className="text-slate-500 text-sm mt-2">All patients have been served</p>
        </div>
      )}

      {/* WAITING SECTION */}
      {waitingPatients.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
            <span className="text-lg">⏳</span>
            <span className="font-bold text-yellow-300">WAITING ({waitingPatients.length})</span>
          </div>

          <div className="space-y-3">
            {waitingPatients.map((patient, idx) => (
              <div
                key={patient.id}
                className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/50 rounded-lg p-4 hover:border-blue-400 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-white">#{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-50 text-lg">{patient.patient_name}</p>
                      <p className="text-xs text-slate-400">ID: {patient.patient_id}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400 capitalize">
                    {patient.service_type}
                  </p>
                </div>

                <div className="mb-3 pb-3 border-b border-slate-600">
                  <p className="text-xs text-slate-400">STATUS</p>
                  <p className="text-sm font-semibold text-yellow-400">
                    ⏳ Waiting {patient.waiting_time_minutes 
                      ? `${patient.waiting_time_minutes.toFixed(1)} min` 
                      : 'Just arrived'}
                  </p>
                </div>

                <button
                  onClick={() => handleCallPatient(patient.patient_id, patient.patient_name)}
                  disabled={actionLoading[patient.patient_id]}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  {actionLoading[patient.patient_id] ? 'Calling...' : 'CALL PATIENT'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IN SERVICE SECTION */}
      {inServicePatients.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-900/30 border border-blue-500/50 rounded-lg">
            <span className="text-lg">🔵</span>
            <span className="font-bold text-blue-300">IN SERVICE ({inServicePatients.length})</span>
          </div>

          <div className="space-y-3">
            {inServicePatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-gradient-to-r from-blue-900/60 to-cyan-900/60 border border-cyan-500/50 rounded-lg p-4 hover:border-cyan-400 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔄</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-50 text-lg">{patient.patient_name}</p>
                      <p className="text-xs text-slate-400">ID: {patient.patient_id}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-cyan-400">Being Served</p>
                </div>

                <button
                  onClick={() => handleFinishPatient(patient.patient_id, patient.patient_name)}
                  disabled={actionLoading[`finish-${patient.patient_id}`]}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  {actionLoading[`finish-${patient.patient_id}`] ? 'Finishing...' : 'FINISH SERVICE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-4 gap-3 text-center">
        <div>
          <p className="text-xs text-slate-400">Waiting</p>
          <p className="text-2xl font-bold text-yellow-400">{waitingPatients.length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">In Service</p>
          <p className="text-2xl font-bold text-blue-400">{inServicePatients.length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-2xl font-bold text-cyan-400">{totalPatients}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Connection</p>
          <p className="text-sm font-semibold text-green-400">🟢 Live</p>
        </div>
      </div>
    </div>
  )
}
