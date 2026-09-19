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

      // ✅ نجلب من patients (الحقيقي) وليس queue_stats (الفارغ)
      const response = await fetch(
        `${API_BASE}/queue/live-patients`,
        { signal: controller.signal }
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = await response.json()
      if (!isMountedRef.current) return

      if (result.success && Array.isArray(result.data)) {
        const patients = result.data
        const now = Date.now()

        // ✅ حساب الإحصائيات من live-patients مباشرة
        const total = patients.length
        const waiting = patients.filter((p) => p.status === 'waiting').length
        const inService = patients.filter((p) => p.status === 'in_service').length
        const completed = patients.filter((p) => p.status === 'completed').length
        const identified = patients.filter((p) => p.identified === true).length
        const unidentified = total - identified

        // ✅ avg_waiting_time: فقط للمرضى الذين انتظروا أقل من 24 ساعة
        const validWaitTimes = patients
          .filter((p) => p.status === 'waiting' && p.arrival_time)
          .map((p) => (now - new Date(p.arrival_time).getTime()) / 60000)
          .filter((m) => m >= 0 && m < 1440)

        const avgWait = validWaitTimes.length > 0
          ? validWaitTimes.reduce((a, b) => a + b, 0) / validWaitTimes.length
          : 0

        const maxWait = validWaitTimes.length > 0
          ? Math.max(...validWaitTimes)
          : 0

        const minWait = validWaitTimes.length > 0
          ? Math.min(...validWaitTimes)
          : 0

        // ✅ avg_service_time: من finish_time - called_time للمكتملين
        const validServiceTimes = patients
          .filter((p) => p.finish_time && p.called_time)
          .map((p) => (new Date(p.finish_time).getTime() - new Date(p.called_time).getTime()) / 60000)
          .filter((m) => m >= 0 && m < 240)

        const avgService = validServiceTimes.length > 0
          ? validServiceTimes.reduce((a, b) => a + b, 0) / validServiceTimes.length
          : 0

        setStats({
          total_patients: total,
          identified,
          unidentified,
          in_service: inService,
          waiting,
          completed,
          avg_waiting_time: avgWait,
          avg_service_time: avgService,
          max_waiting_time: maxWait,
          min_waiting_time: minWait,
          rating: 4.8,
        })
        setError(null)
      } else {
        setError(result.error || 'Failed')
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