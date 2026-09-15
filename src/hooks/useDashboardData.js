// ═══════════════════════════════════════════════════════════
//  Hook - useDashboardData موحّد
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react'

export function useDashboardData(fetchFunction, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const requestIdRef = useRef(0)
  const abortControllerRef = useRef(null)
  const isMountedRef = useRef(true)

  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestIdRef.current

      // ✅ إلغاء الطلب السابق
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      if (!silent) setLoading(true)
      else setRefreshing(true)

      try {
        const result = await fetchFunction(controller.signal)

        // ✅ تجاهل إذا وصل طلب أحدث
        if (requestId !== requestIdRef.current || !isMountedRef.current) return

        setData(result)
        setLastUpdated(new Date())
        setError(null)
      } catch (err) {
        if (err.name === 'AbortError' || requestId !== requestIdRef.current || !isMountedRef.current) return

        setError(err.message)
      } finally {
        if (requestId === requestIdRef.current && isMountedRef.current) {
          if (!silent) setLoading(false)
          else setRefreshing(false)
        }
      }
    },
    [fetchFunction]
  )

  // ✅ أول مرة
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ✅ Auto-refresh مع visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        return // لا تحدّث عندما تكون الصفحة مخفية
      }
      fetchData({ silent: true })
    }

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData({ silent: true })
      }
    }, 30000)

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchData])

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [])

  return { data, loading, refreshing, error, lastUpdated, refetch: fetchData }
}
