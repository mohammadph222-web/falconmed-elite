// ═══════════════════════════════════════════════════════════
//  useQueueActions - Call / Finish Patient
// ═══════════════════════════════════════════════════════════

import { useState } from 'react'
import { API_BASE } from '../config/api'

export function useQueueActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callPatient = async (patientId, pharmacistId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/queue/patient-called`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          pharmacist_id: pharmacistId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to call patient')
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const finishPatient = async (patientId, pharmacistId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/queue/patient-finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          pharmacist_id: pharmacistId,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to finish patient')
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { callPatient, finishPatient, loading, error }
}