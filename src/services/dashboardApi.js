// ═══════════════════════════════════════════════════════════
//  API Layer - PRODUCTION READY v3
//  جميع الـ 8 endpoints الجديدة + Demo Fallbacks
// ═══════════════════════════════════════════════════════════

const API_URL =
  import.meta.env.VITE_API_URL || 'https://falconmed-backend.onrender.com/api'

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

const buildParams = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      key !== 'branchId' &&
      key !== 'limit'
    ) {
      search.append(key, value)
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

const retryAsync = async (fn, maxRetries = 2, baseDelay = 300, signal) => {
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      return await fn()
    } catch (err) {
      const isClientError =
        err?.status === 401 ||
        err?.status === 403 ||
        err?.status === 404
      const isAbortError = err?.name === 'AbortError'
      const isNonRetryable = err?.retryable === false

      if (isAbortError || isClientError || isNonRetryable) {
        throw err
      }

      lastError = err
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}

const apiRequest = async (endpoint, options = {}) => {
  const { signal, retries = 2 } = options

  return retryAsync(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      if (signal) {
        if (signal.aborted) {
          clearTimeout(timeoutId)
          throw new DOMException('Aborted', 'AbortError')
        }
        signal.addEventListener('abort', () => controller.abort())
      }

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`)
          error.status = response.status
          throw error
        }

        const json = await response.json()

        if (json?.success === false) {
          const error = new Error(json.message || 'Request failed')
          error.status = 200
          error.retryable = false
          throw error
        }
        return json
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    },
    retries,
    300,
    signal
  )
}

const safeSlice = (data, limit) => {
  if (!Array.isArray(data)) return []
  return data.slice(0, limit)
}

// ═══════════════════════════════════════════════════════════
// ✅ REAL ENDPOINTS - PHARMACIST
// ═══════════════════════════════════════════════════════════

export const getStats = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  const query = buildParams({ from, to })
  const result = await apiRequest(`/queue/stats${query}`, { signal, retries })
  return { ...result, filters: { from, to } }
}

export const getLivePatients = async ({ signal, retries = 2 } = {}) => {
  return apiRequest('/queue/live-patients', { signal, retries })
}

export const getHourlyData = async (
  userId,
  { from = '', to = '', signal, retries = 2 } = {}
) => {
  const query = buildParams({ from, to })
  const result = await apiRequest(`/dashboard/hourly/${userId || 1}${query}`, {
    signal,
    retries,
  })
  return { ...result, filters: { userId, from, to } }
}

// ═══════════════════════════════════════════════════════════
// ✅ REAL ENDPOINTS - MANAGER (NEW)
// ═══════════════════════════════════════════════════════════

export const getBranchStats = async (
  branchId,
  from = '',
  to = '',
  { signal, retries = 2 } = {}
) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/branches/${branchId}/stats${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: false, filters: { branchId, from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn(`⚠️ Branch stats endpoint unavailable — using DEMO DATA (Branch ${branchId})`)
    return {
      data: {
        total_patients: 234,
        identified: 230,
        unidentified: 4,
        avg_service_time: 20.0,
        avg_waiting_time: 2.5,
        identified_percentage: 98.3,
        staff_count: 5,
        serve_rate: 98.5,
      },
      isDemoData: true,
      filters: { branchId, from, to },
    }
  }
}

export const getBranchPerformers = async ({
  branchId,
  from = '',
  to = '',
  limit = 5,
  signal,
  retries = 2,
} = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/branches/${branchId}/performers${query}`, {
      signal,
      retries,
    })
    return {
      ...result,
      data: safeSlice(result?.data?.performers || result?.data || [], limit),
      isDemoData: false,
      filters: { branchId, from, to, limit },
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn(`⚠️ Performers endpoint unavailable — using DEMO DATA`)
    const performers = [
      { staff_name: 'لما الـ رميث', patients_served: 189, avg_service_time: 2.8, rating: 4.9 },
      { staff_name: 'فاطمة الـ عامري', patients_served: 176, avg_service_time: 3.1, rating: 4.7 },
      { staff_name: 'أحمد الـ القابي', patients_served: 168, avg_service_time: 3.2, rating: 4.6 },
      { staff_name: 'سارة الـ الشامسي', patients_served: 156, avg_service_time: 3.4, rating: 4.5 },
      { staff_name: 'محمود الـ مزروعي', patients_served: 145, avg_service_time: 3.5, rating: 4.4 },
    ]
    return {
      data: safeSlice(performers, limit),
      isDemoData: true,
      filters: { branchId, from, to, limit },
    }
  }
}

export const getBranchHourly = async (
  branchId,
  from = '',
  to = '',
  { signal, retries = 2 } = {}
) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/branches/${branchId}/hourly${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: false, filters: { branchId, from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn(`⚠️ Hourly endpoint unavailable — using DEMO DATA`)
    return {
      data: {
        hourly: [
          { time: '00:00', patients: 45, identified: 44, avgTime: 18 },
          { time: '04:00', patients: 52, identified: 51, avgTime: 19 },
          { time: '08:00', patients: 78, identified: 76, avgTime: 20 },
          { time: '12:00', patients: 95, identified: 93, avgTime: 21 },
          { time: '16:00', patients: 88, identified: 86, avgTime: 22 },
          { time: '20:00', patients: 65, identified: 63, avgTime: 20 },
          { time: '24:00', patients: 48, identified: 46, avgTime: 19 },
        ],
      },
      isDemoData: true,
      filters: { branchId, from, to },
    }
  }
}

export const getBranchAlerts = async (
  branchId,
  { signal, retries = 2 } = {}
) => {
  try {
    const result = await apiRequest(`/branches/${branchId}/alerts`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: false, filters: { branchId } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn(`⚠️ Alerts endpoint unavailable — using DEMO DATA`)
    return {
      data: {
        alerts: [
          {
            id: 'HIGH_QUEUE',
            type: 'warning',
            title: 'High Queue',
            message: '20 patients waiting',
            severity: 'high',
          },
          {
            id: 'LOW_IDENTIFIED',
            type: 'info',
            title: 'Identification Rate',
            message: 'Only 98.3% patients identified',
            severity: 'medium',
          },
        ],
        metrics: {
          avg_waiting: 2.5,
          current_queue: 20,
          identified_rate: 98.3,
        },
      },
      isDemoData: true,
      filters: { branchId },
    }
  }
}

// ═══════════════════════════════════════════════════════════
// ✅ REAL ENDPOINTS - ADMIN (NEW)
// ═══════════════════════════════════════════════════════════

export const getNetworkStats = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/stats${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: false, filters: { from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Network stats endpoint unavailable — using DEMO DATA')
    return {
      data: {
        total_patients: 8870,
        active_branches: 5,
        identified: 8756,
        unidentified: 114,
        avg_service_time: 20.5,
        avg_waiting_time: 2.8,
        total_staff: 25,
        identified_percentage: 98.7,
        serve_rate: 98.7,
        no_show_rate: 1.3,
      },
      isDemoData: true,
      filters: { from, to },
    }
  }
}

export const getNetworkBranches = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/branches${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: false, filters: { from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Network branches endpoint unavailable — using DEMO DATA')
    return {
      data: {
        branches: [
          { id: 1, name: 'Main Branch', total_patients: 1774, identified: 1757, serve_rate: 99.0, avg_service_time: 20.0, staff_count: 5, status: 'Excellent' },
          { id: 2, name: 'Al Ain Branch', total_patients: 1650, identified: 1630, serve_rate: 98.8, avg_service_time: 20.5, staff_count: 5, status: 'Excellent' },
          { id: 3, name: 'Khalifa Branch', total_patients: 1542, identified: 1520, serve_rate: 98.6, avg_service_time: 21.0, staff_count: 4, status: 'Good' },
          { id: 4, name: 'Mafraq Branch', total_patients: 1489, identified: 1468, serve_rate: 98.6, avg_service_time: 21.0, staff_count: 4, status: 'Good' },
          { id: 5, name: 'Startup Branch', total_patients: 1260, identified: 1240, serve_rate: 98.4, avg_service_time: 20.5, staff_count: 3, status: 'Good' },
        ],
      },
      isDemoData: true,
      filters: { from, to },
    }
  }
}

export const getNetworkTrends = async (
  from = '',
  to = '',
  granularity = 'daily',
  { signal, retries = 2 } = {}
) => {
  try {
    const query = buildParams({ from, to, granularity })
    const result = await apiRequest(`/network/trends${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: false, filters: { from, to, granularity } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Network trends endpoint unavailable — using DEMO DATA')
    return {
      data: {
        trends: [
          { date: '2026-09-10', patients: 1200, identified: 1184, serveRate: 98.7, avgServiceTime: 20, avgWaitingTime: 2.5 },
          { date: '2026-09-11', patients: 1300, identified: 1283, serveRate: 98.7, avgServiceTime: 20.5, avgWaitingTime: 2.8 },
          { date: '2026-09-12', patients: 1400, identified: 1382, serveRate: 98.7, avgServiceTime: 21, avgWaitingTime: 3.0 },
          { date: '2026-09-13', patients: 1450, identified: 1432, serveRate: 98.8, avgServiceTime: 20.5, avgWaitingTime: 2.7 },
          { date: '2026-09-14', patients: 1380, identified: 1362, serveRate: 98.7, avgServiceTime: 20, avgWaitingTime: 2.5 },
          { date: '2026-09-15', patients: 1320, identified: 1302, serveRate: 98.6, avgServiceTime: 20.5, avgWaitingTime: 2.8 },
          { date: '2026-09-16', patients: 1400, identified: 1384, serveRate: 98.9, avgServiceTime: 21, avgWaitingTime: 3.0 },
        ],
      },
      isDemoData: true,
      filters: { from, to, granularity },
    }
  }
}

export const getNetworkStaff = async (
  from = '',
  to = '',
  limit = 10,
  { signal, retries = 2 } = {}
) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/staff${query}`, {
      signal,
      retries,
    })
    return {
      ...result,
      data: safeSlice(result?.data?.staff || result?.data || [], limit),
      isDemoData: false,
      filters: { from, to, limit },
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Network staff endpoint unavailable — using DEMO DATA')
    const staff = [
      { staff_name: 'رشا أحمد علي', branch_name: 'Main Branch', patients_served: 189, avg_service_time: 2.8, rating: 4.9 },
      { staff_name: 'سارة خالد عمر', branch_name: 'Al Ain Branch', patients_served: 176, avg_service_time: 3.1, rating: 4.7 },
      { staff_name: 'أحمد علي محمد', branch_name: 'Main Branch', patients_served: 168, avg_service_time: 3.2, rating: 4.6 },
      { staff_name: 'أسيل علي أحمد', branch_name: 'Khalifa Branch', patients_served: 156, avg_service_time: 3.4, rating: 4.5 },
      { staff_name: 'جميلة حمد علي', branch_name: 'Mafraq Branch', patients_served: 145, avg_service_time: 3.5, rating: 4.4 },
      { staff_name: 'فهد محمد سالم', branch_name: 'Startup Branch', patients_served: 134, avg_service_time: 3.6, rating: 4.3 },
      { staff_name: 'منار حسين الشامسية', branch_name: 'Al Ain Branch', patients_served: 125, avg_service_time: 3.7, rating: 4.2 },
      { staff_name: 'سالمة محمد علي', branch_name: 'Main Branch', patients_served: 116, avg_service_time: 3.8, rating: 4.1 },
      { staff_name: 'مريم علي ناصر', branch_name: 'Khalifa Branch', patients_served: 107, avg_service_time: 3.9, rating: 4.0 },
      { staff_name: 'علي محمود أحمد', branch_name: 'Mafraq Branch', patients_served: 98, avg_service_time: 4.0, rating: 3.9 },
    ]
    return {
      data: safeSlice(staff, limit),
      isDemoData: true,
      filters: { from, to, limit },
    }
  }
}

// ═══════════════════════════════════════════════════════════
// ⚠️ DEMO ENDPOINTS (Fallback)
// ═══════════════════════════════════════════════════════════

export const getMetrics = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/dashboard/metrics${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: false, filters: { from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Metrics endpoint unavailable — using DEMO DATA')
    return {
      data: {
        total_patients: 1774,
        identified: 1757,
        unidentified: 17,
        avg_service_time: 20.0,
        avg_waiting_time: 2.5,
        serve_rate: 99.0,
      },
      isDemoData: true,
      filters: { from, to },
    }
  }
}

// ═══════════════════════════════════════════════════════════
// 📊 EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  // Pharmacist
  getStats,
  getLivePatients,
  getHourlyData,
  getMetrics,
  
  // Manager
  getBranchStats,
  getBranchPerformers,
  getBranchHourly,
  getBranchAlerts,
  
  // Admin
  getNetworkStats,
  getNetworkBranches,
  getNetworkTrends,
  getNetworkStaff,
}
