// ═══════════════════════════════════════════════════════════
//  useLivePatients - Works with actual backend format
//  Backend returns: id, patient_id, patient_name, branch_id (number),
//  status, service_type, arrival_time, called_time, finish_time, identified
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config/api'

const BRANCH_NAMES = {
  1: 'Main Branch',
  2: 'Dusit Branch',
  3: 'Ruwi Branch',
}

function enrichPatient(p) {
  const arrivalTime = p.arrival_time ? new Date(p.arrival_time) : null
  const now = new Date()
  const waitingMinutes = arrivalTime
    ? Math.max(0, Math.round((now - arrivalTime) / 60000))
    : 0

  return {
    id: p.id,
    patient_id: p.patient_id?.trim() || 'N/A',
    patient_name: p.patient_name || 'Unknown',
    branch_id: p.branch_id,
    branch_name: BRANCH_NAMES[p.branch_id] || `Branch ${p.branch_id}`,
    status: p.status || 'unknown',
    service_type: p.service_type || 'general',
    arrival_time: p.arrival_time,
    called_time: p.called_time,
    finish_time: p.finish_time,
    identified: Boolean(p.identified),
    waiting_time: waitingMinutes,
  }
}

export function useLivePatients(pollMs = 5000) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isMountedRef = useRef(true)
  const abortRef = useRef(null)

  useEffect(() => {
    isMountedRef.current = true
    let firstLoad = true

    const fetchPatients = async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        if (firstLoad) setLoading(true)

        const response = await fetch(`${API_BASE}/queue/live-patients`, {
          signal: controller.signal,
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        if (!isMountedRef.current) return

        if (result.success && Array.isArray(result.data)) {
          setPatients(result.data.map(enrichPatient))
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch')
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMountedRef.current) {
          setError(err.message)
        }
      } finally {
        if (firstLoad && isMountedRef.current) {
          setLoading(false)
          firstLoad = false
        }
      }
    }

    fetchPatients()
    const interval = setInterval(fetchPatients, pollMs)

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [pollMs])

  return { patients, loading, error }
}