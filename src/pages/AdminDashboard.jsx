import { useDashboardData } from '../hooks/useDashboardData'
import { useLivePatients } from '../hooks/useLivePatients'

export default function AdminDashboard({ user }) {
  const { stats, loading, error } = useDashboardData(user?.id || 'admin_001')
  const { patients: livePatients } = useLivePatients(5000)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📊 Admin Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">Total Patients</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_patients ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">Identified</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.identified ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">Waiting</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.waiting ?? 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold">In Service</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.in_service ?? 0}</p>
            </div>
          </div>

          {/* Live Queue */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">📋 Live Patients ({livePatients.length})</h2>
            </div>
            {livePatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Branch</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livePatients.map((patient, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{patient.patient_id}</td>
                        <td className="px-6 py-4 text-sm">{patient.branch_id}</td>
                        <td className="px-6 py-4 text-sm">{patient.service_type || 'General'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            patient.status === 'waiting' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No patients in queue</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center p-8">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  )
}
