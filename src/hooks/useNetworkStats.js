// ═══════════════════════════════════════════════════════════
//  useNetworkStats - Admin Dashboard Data
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config/api'

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function useNetworkStats() {
  const [stats, setStats] = useState(null)
  const [branches, setBranches] = useState([])
  const [trends, setTrends] = useState([])
  const [staff, setStaff] = useState([])
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
          fetch(`${API_BASE}/network/stats`, { signal: controller.signal }),
          fetch(`${API_BASE}/network/branches`, { signal: controller.signal }),
          fetch(`${API_BASE}/network/trends`, { signal: controller.signal }),
          fetch(`${API_BASE}/network/staff`, { signal: controller.signal }),
        ])

        if (!isMountedRef.current) return

        // Stats
        if (results[0].status === 'fulfilled' && results[0].value.ok) {
          const r = await results[0].value.json()
          if (r.success) {
            const d = r.data || {}
            setStats({
              total_patients: num(d.total_patients),
              active_branches: num(d.active_branches),
              identified: num(d.identified),
              unidentified: num(d.unidentified),
              avg_service_time: num(d.avg_service_time),
              avg_waiting_time: num(d.avg_waiting_time),
              total_staff: num(d.total_staff),
              identified_percentage: num(d.identified_percentage),
              serve_rate: num(d.serve_rate),
              no_show_rate: num(d.no_show_rate),
            })
          }
        }

        // Branches
        if (results[1].status === 'fulfilled' && results[1].value.ok) {
          const r = await results[1].value.json()
          if (r.success && Array.isArray(r.data?.branches)) {
            setBranches(
              r.data.branches.map((b) => ({
                id: b.id,
                name: b.name || `Branch ${b.id}`,
                total_patients: num(b.total_patients),
                identified: num(b.identified),
                serve_rate: num(b.serve_rate),
                avg_service_time: num(b.avg_service_time),
                staff_count: num(b.staff_count),
                status: b.status || 'Good',
              }))
            )
          }
        }

        // Trends
        if (results[2].status === 'fulfilled' && results[2].value.ok) {
          const r = await results[2].value.json()
          if (r.success && Array.isArray(r.data?.trends)) {
            setTrends(
              r.data.trends.map((t) => ({
                date: t.date
                  ? new Date(t.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '',
                patients: num(t.patients),
                identified: num(t.identified),
                serveRate: num(t.serveRate),
                avgServiceTime: num(t.avgServiceTime),
                avgWaitingTime: num(t.avgWaitingTime),
              }))
            )
          }
        }

        // Staff ← ✅ مُصلح: يدعم `staff` و `performers`
        if (results[3].status === 'fulfilled' && results[3].value.ok) {
          const r = await results[3].value.json()
          const staffList = r.data?.staff || r.data?.performers || []
          if (r.success && Array.isArray(staffList)) {
            setStaff(
              staffList.map((s) => ({
                id: s.id || s.staff_name,
                name: s.name || s.staff_name || 'Unknown',
                branch_id: s.branch_id || s.branch_name || '',  // ✅ يدعم branch_name
                total_patients: num(s.total_patients || s.patients_served),
                avg_service_time: num(s.avg_service_time),
                avg_waiting_time: num(s.avg_waiting_time),
                rating: num(s.rating) || 4.5,
                alerts_count: num(s.alerts_count),
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
  }, [])

  return { stats, branches, trends, staff, loading, error }
}