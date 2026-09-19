// ═══════════════════════════════════════════════════════════
//  useDashboardData - Works with actual backend
//  Handles: string values, missing fields, normalized output
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react'
import { API_BASE } from '../config/api'

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function useDashboardData(userId = 'ph_001') {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isMountedRef = useRef(true)
  const abortRef = useRef(null)
  const firstLoadRef = useRef(true)

  const fetchStats = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      if (firstLoadRef.current) setLoading(true)

      const response = await fetch(
        `${API_BASE}/queue/stats?userId=${encodeURIComponent(userId)}`,
        { signal: controller.signal }
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = await response.json()
      if (!isMountedRef.current) return

      if (result.success) {
        const d = result.data || {}
        setStats({
          total_patients: num(d.total_patients),
          identified: num(d.identified),
          unidentified: num(d.unidentified),
          in_service: num(d.in_service),
          waiting: num(d.waiting),
          avg_waiting_time: num(d.avg_waiting_time),
          avg_service_time: num(d.avg_service_time),
          max_waiting_time: num(d.max_waiting_time),
          min_waiting_time: num(d.min_waiting_time),
          rating: num(d.rating),
        })
        setError(null)
      } else {
        setError(result.error || result.message || 'Failed')
      }
    } catch (err) {
      if (err.name === 'AbortError' || !isMountedRef.current) return
      setError(err.message)
    } finally {
      if (firstLoadRef.current && isMountedRef.current) {
        setLoading(false)
        firstLoadRef.current = false
      }
    }
  }, [userId])

  useEffect(() => {
    isMountedRef.current = true
    firstLoadRef.current = true

    fetchStats()
    const interval = setInterval(fetchStats, 5000)

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}