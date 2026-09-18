import { useState, useEffect } from 'react'
import { Plus, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function QueueMachineSimulator() {
  const [patientData, setPatientData] = useState({
    patient_id: '',
    patient_name: '',
    branch_id: 1,
    service_type: 'pharmacy'
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [history, setHistory] = useState([])
  
  // Live Stats State
  const [stats, setStats] = useState(null)

  // Fetch Live Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          'https://falconmed-backend.onrender.com/api/queue/stats?userId=ph_001'
        )
        const data = await response.json()
        if (data.success) setStats(data.data)
      } catch (error) {
        console.error('Stats error:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPatientData(prev => ({
      ...prev,
      [name]: name === 'branch_id' ? parseInt(value) : value
    }))
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
      const response = await fetch(
        'https://falconmed-backend.onrender.com/api/queue/patient-arrival',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData)
        }
      )

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ Patient registered: ${patientData.patient_name}`)
        setMessageType('success')
        
        // Add to history
        setHistory(prev => [{
          id: patientData.patient_id,
          name: patientData.patient_name,
          timestamp: new Date().toLocaleTimeString(),
          status: 'Registered'
        }, ...prev])

        // Reset form
        setPatientData({
          patient_id: '',
          patient_name: '',
          branch_id: 1,
          service_type: 'pharmacy'
        })
      } else {
        setMessage(`❌ Error: ${data.error}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(`❌ Connection Error: ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdd = () => {
    const randomId = `P${Math.floor(Math.random() * 10000)}`
    const names = ['أحمد علي', 'فاطمة محمد', 'محمد حسن', 'سارة خالد', 'علي محمود', 'نور الدين']
    const randomName = names[Math.floor(Math.random() * names.length)]
    
    setPatientData({
      patient_id: randomId,
      patient_name: randomName,
      branch_id: 1,
      service_type: 'pharmacy'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🖥️ Queue Machine Simulator</h1>
          <p className="text-blue-200">Test the Patient Registration Flow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Register Patient</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Patient ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    name="patient_id"
                    value={patientData.patient_id}
                    onChange={handleInputChange}
                    placeholder="e.g., P001"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    disabled={loading}
                  />
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patient_name"
                    value={patientData.patient_name}
                    onChange={handleInputChange}
                    placeholder="e.g., أحمد علي"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    disabled={loading}
                  />
                </div>

                {/* Branch ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch
                  </label>
                  <select
                    name="branch_id"
                    value={patientData.branch_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    disabled={loading}
                  >
                    <option value={1}>Main Branch</option>
                    <option value={2}>Dusit Branch</option>
                    <option value={3}>Ruwi Branch</option>
                  </select>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    name="service_type"
                    value={patientData.service_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    disabled={loading}
                  >
                    <option value="pharmacy">Pharmacy</option>
                    <option value="consultation">Consultation</option>
                    <option value="vaccination">Vaccination</option>
                  </select>
                </div>

                {/* Status Message */}
                {message && (
                  <div className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    messageType === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {messageType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message}
                  </div>
                )}

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send size={18} />
                    {loading ? 'Sending...' : 'Submit'}
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={18} />
                    Quick Test
                  </button>
                </div>
              </form>
            </div>

            {/* Instructions */}
            <div className="bg-blue-100 rounded-xl p-4 mt-6">
              <h3 className="font-bold text-blue-900 mb-2">📝 How to Test:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Fill in patient info</li>
                <li>2. Click Submit</li>
                <li>3. Check Stats Below</li>
                <li>4. Watch Real-time Update!</li>
              </ol>
            </div>
          </div>

          {/* Live Status & History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card */}
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">✅ API Status</h2>
              <p className="text-lg mb-4">Backend: <span className="font-bold">LIVE</span></p>
              <p className="text-sm">
                Endpoint: https://falconmed-backend.onrender.com/api/queue/patient-arrival
              </p>
            </div>

            {/* Live Queue Stats */}
            {stats && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Live Queue Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatBox title="Total Patients" value={stats.total_patients} color="blue" />
                  <StatBox title="Waiting" value={stats.waiting} color="orange" />
                  <StatBox title="In Service" value={stats.in_service} color="green" />
                  <StatBox title="Identified" value={stats.identified} color="teal" />
                  <StatBox title="Avg Wait (min)" value={stats.avg_waiting_time} color="purple" />
                  <StatBox title="Avg Service (min)" value={stats.avg_service_time} color="indigo" />
                </div>
                <p className="text-xs text-gray-500 mt-4">🔄 Auto-refreshing every 5 seconds</p>
              </div>
            )}

            {/* Registration History */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={24} className="text-blue-600" />
                Registration History
              </h2>

              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No patients registered yet</p>
                  <p className="text-sm mt-2">Start by filling the form and clicking Submit</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((patient, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-600">ID: {patient.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">{patient.status}</p>
                          <p className="text-xs text-gray-500">{patient.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-purple-100 rounded-xl p-6">
              <h3 className="font-bold text-purple-900 mb-2">🚀 Next Steps:</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✅ Register patients via this simulator</li>
                <li>✅ Watch Queue Statistics update in real-time</li>
                <li>✅ Check total patients, waiting, in service</li>
                <li>✅ Monitor average wait & service times</li>
                <li>✅ Repeat for more data!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// StatBox Component for Stats Display
function StatBox({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-600 text-blue-600',
    orange: 'bg-orange-50 border-orange-600 text-orange-600',
    green: 'bg-green-50 border-green-600 text-green-600',
    teal: 'bg-teal-50 border-teal-600 text-teal-600',
    purple: 'bg-purple-50 border-purple-600 text-purple-600',
    indigo: 'bg-indigo-50 border-indigo-600 text-indigo-600'
  }
  
  return (
    <div className={`${colors[color]} p-4 rounded-lg border-l-4`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
