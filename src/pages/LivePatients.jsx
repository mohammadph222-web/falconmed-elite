import { useLivePatients } from '../hooks/useLivePatients'

export default function LivePatients() {
  const { patients, loading, error } = useLivePatients(5000)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-600">Loading patients...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">📋 Live Patients ({patients.length})</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {patients.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {patients.map((patient, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">#{idx + 1} - {patient.patient_id}</p>
                  <p className="text-sm text-gray-600 mt-1">{patient.branch_id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  patient.status === 'waiting'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {patient.status === 'waiting' ? '⏳ Waiting' : '💊 In Service'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>No patients in queue</p>
        </div>
      )}
    </div>
  )
}
