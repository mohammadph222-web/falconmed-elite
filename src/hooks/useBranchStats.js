// ═══════════════════════════════════════════════════════════
//  useBranchStats - Manager Dashboard Data
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config/api'

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function useBranchStats(branchId = '1') {
  const [stats, setStats] = useState(null)
  const [performers, setPerformers] = useState([])
  const [hourly, setHourly] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isMountedRef = useRef(true)
  const abortRef = useRef(null)
  const firstLoadRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    firstLoadRef.current = true

    const fetchData = async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        if (firstLoadRef.current) setLoading(true)

        const results = await Promise.allSettled([
          fetch(`${API_BASE}/branches/${branchId}/stats`, { signal: controller.signal }),
          fetch(`${API_BASE}/branches/${branchId}/performers?limit=10`, { signal: controller.signal }),
          fetch(`${API_BASE}/branches/${branchId}/hourly`, { signal: controller.signal }),
        ])

        if (!isMountedRef.current) return

        // Stats
        if (results[0].status === 'fulfilled' && results[0].value.ok) {
          const r = await results[0].value.json()
          if (r.success) {
            const d = r.data || {}
            setStats({
              total_patients: num(d.total_patients),
              identified: num(d.identified),
              unidentified: num(d.unidentified),
              avg_service_time: num(d.avg_service_time),
              avg_waiting_time: num(d.avg_waiting_time),
              staff_count: num(d.staff_count),
              identified_percentage: num(d.identified_percentage),
              serve_rate: num(d.serve_rate),
              branch_id: d.branch_id || branchId,
            })
          }
        }

        // Performers
        if (results[1].status === 'fulfilled' && results[1].value.ok) {
          const r = await results[1].value.json()
          const perfList = r.data?.performers || r.data?.staff || []
          if (r.success && Array.isArray(perfList)) {
            setPerformers(
              perfList.map((s) => ({
                name: s.staff_name || s.name || 'Unknown',
                patients_served: num(s.patients_served || s.total_patients),
                avg_service_time: num(s.avg_service_time),
                avg_waiting_time: num(s.avg_waiting_time),
                rating: num(s.rating) || 4.5,
              }))
            )
          }
        }

        // Hourly
        if (results[2].status === 'fulfilled' && results[2].value.ok) {
          const r = await results[2].value.json()
          if (r.success && Array.isArray(r.data?.hourly)) {
            setHourly(
              r.data.hourly.map((h) => ({
                time: h.time || '',
                patients: num(h.patients),
                identified: num(h.identified),
                avgTime: num(h.avgTime),
              }))
            )
          }
        }

        setError(null)
      } catch (err) {
        if (err.name === 'AbortError' || !isMountedRef.current) return
        setError(err.message)
      } finally {
        if (firstLoadRef.current && isMountedRef.current) {
          setLoading(false)
          firstLoadRef.current = false
        }
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [branchId])

  return { stats, performers, hourly, loading, error }
}