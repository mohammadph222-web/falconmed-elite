// ═══════════════════════════════════════════════════════════
//  API Layer - PRODUCTION READY v2
//  جميع المشاكل الـ 4 محلولة
// ═══════════════════════════════════════════════════════════

const API_URL =
  import.meta.env.VITE_API_URL || 'https://falconmed-backend.onrender.com/api'

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

/**
 * ✅ Build query parameters - تجاهل القيم الفارغة
 * ❌ لا تضيف branchId أو limit في query (هم في path!)
 */
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

/**
 * ✅ Retry with exponential backoff
 * ✅ 1. تحقق من error.retryable flag
 * ✅ 3. تجاهل الأخطاء غير القابلة لإعادة المحاولة
 */
const retryAsync = async (fn, maxRetries = 2, baseDelay = 300, signal) => {
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      return await fn()
    } catch (err) {
      // ✅ تحقق من error.retryable flag
      const isClientError =
        err?.status === 401 ||
        err?.status === 403 ||
        err?.status === 404
      const isAbortError = err?.name === 'AbortError'
      const isNonRetryable = err?.retryable === false

      // لا تحاول مجدد للـ 4xx و AbortError و non-retryable errors
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

/**
 * ✅ Main API request handler
 * ✅ 1. انقل AbortController و setTimeout داخل الدالة
 *       → كل محاولة لها timeout خاص بها
 * ✅ 2. أضف error.retryable flag لـ success: false
 */
const apiRequest = async (endpoint, options = {}) => {
  const { signal, retries = 2 } = options

  return retryAsync(
    async () => {
      // ✅ 1. AbortController و setTimeout داخل الدالة
      //       → كل محاولة لها timeout خاص بها!
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

        // ✅ 2. أضف error.retryable = false لـ success: false
        if (json?.success === false) {
          const error = new Error(json.message || 'Request failed')
          error.status = 200
          error.retryable = false  // ← لا تُعد المحاولة!
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

/**
 * ✅ آمن: تطبيق limit فقط إذا كانت data مصفوفة
 */
const safeSlice = (data, limit) => {
  if (!Array.isArray(data)) return []
  return data.slice(0, limit)
}

// ═══════════════════════════════════════════════════════════
// ✅ REAL ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * ✅ GET /api/queue/stats
 * ✅ 4. أضف filters حتى في real endpoints للاتساق
 */
export const getStats = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  const query = buildParams({ from, to })
  const result = await apiRequest(`/queue/stats${query}`, { signal, retries })
  return { ...result, filters: { from, to } }  // ✅ أضف filters دائماً
}

/**
 * ✅ GET /api/queue/live-patients
 */
export const getLivePatients = async ({ signal, retries = 2 } = {}) => {
  return apiRequest('/queue/live-patients', { signal, retries })
}

/**
 * ✅ GET /api/dashboard/hourly/:userId
 */
export const getHourlyData = async (
  userId,
  { from = '', to = '', signal, retries = 2 } = {}
) => {
  const query = buildParams({ from, to })
  const result = await apiRequest(`/dashboard/hourly/${userId || 1}${query}`, {
    signal,
    retries,
  })
  return { ...result, filters: { userId, from, to } }  // ✅ أضف filters
}

// ═══════════════════════════════════════════════════════════
// ⚠️ DEMO ENDPOINTS
// TODO: Backend endpoints
// ═══════════════════════════════════════════════════════════

/**
 * ⚠️ GET /api/dashboard/metrics
 */
export const getMetrics = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/dashboard/metrics${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: result?.isDemoData ?? false, filters: { from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Metrics endpoint unavailable — using DEMO DATA')
    return {
      data: {
        total_patients: 1774,
        identified: 1757,
        unidentified: 17,
        avg_service_time: 3.2,
        avg_waiting_time: 5.1,
        serve_rate: 99.3,
      },
      isDemoData: true,
      filters: { from, to },
    }
  }
}

/**
 * ⚠️ GET /api/branches/:id/stats
 */
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
    return { ...result, isDemoData: result?.isDemoData ?? false, filters: { branchId, from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn(`⚠️ Branch stats DEMO — branch ${branchId}`)
    return {
      data: {
        total_patients: 234,
        identified: 230,
        unidentified: 4,
        serve_rate: 98.5,
        staff_count: 5,
      },
      isDemoData: true,
      filters: { branchId, from, to },
    }
  }
}

/**
 * ⚠️ GET /api/branches/:id/performers
 * ✅ 3. تحقق أن data مصفوفة قبل slice
 */
export const getTopPerformers = async ({
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
      data: safeSlice(result?.data, limit),  // ✅ استخدم safeSlice
      isDemoData: result?.isDemoData ?? false,
      filters: { branchId, from, to, limit },
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn(`⚠️ Top performers DEMO — branch ${branchId}`)
    const allPerformers = [
      { name: 'LAMA AL-REMIT', patients: 189, avgTime: 2.8, rating: 4.9 },
      { name: 'FATIMA AL-AMERI', patients: 176, avgTime: 3.1, rating: 4.7 },
      { name: 'AHMED AL-KAABI', patients: 168, avgTime: 3.2, rating: 4.6 },
      { name: 'SARA AL-SHAMMASI', patients: 156, avgTime: 3.4, rating: 4.5 },
      { name: 'MOHAMMED AL-MAZROUEI', patients: 145, avgTime: 3.5, rating: 4.4 },
    ]
    return {
      data: safeSlice(allPerformers, limit),  // ✅ استخدم safeSlice
      isDemoData: true,
      filters: { branchId, from, to, limit },
    }
  }
}

/**
 * ⚠️ GET /api/network/stats
 */
export const getNetworkStats = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/stats${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: result?.isDemoData ?? false, filters: { from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Network stats DEMO — endpoint missing')
    return {
      data: {
        total_patients: 8870,
        active_branches: 5,
        serve_rate: 98.5,
        total_staff: 25,
      },
      isDemoData: true,
      filters: { from, to },
    }
  }
}

/**
 * ⚠️ GET /api/network/branches
 */
export const getBranches = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/branches${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: result?.isDemoData ?? false, filters: { from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Branches DEMO — endpoint missing')
    return {
      data: [
        { id: 1, name: 'Main Branch', patients: 1774, rate: 99.3, staff: 5, status: 'Excellent' },
        { id: 2, name: 'Al Ain Branch', patients: 1650, rate: 98.9, staff: 5, status: 'Excellent' },
        { id: 3, name: 'Khalifa Branch', patients: 1542, rate: 98.6, staff: 4, status: 'Good' },
        { id: 4, name: 'Mafraq Branch', patients: 1489, rate: 98.5, staff: 4, status: 'Good' },
        { id: 5, name: 'Startup Branch', patients: 1260, rate: 98.3, staff: 3, status: 'Good' },
      ],
      isDemoData: true,
      filters: { from, to },
    }
  }
}

/**
 * ⚠️ GET /api/network/trends
 */
export const getNetworkTrends = async (from = '', to = '', { signal, retries = 2 } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/trends${query}`, {
      signal,
      retries,
    })
    return { ...result, isDemoData: result?.isDemoData ?? false, filters: { from, to } }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Network trends DEMO — endpoint missing')
    return {
      data: [
        { time: '00:00', patients: 45 },
        { time: '04:00', patients: 52 },
        { time: '08:00', patients: 78 },
        { time: '12:00', patients: 95 },
        { time: '16:00', patients: 88 },
        { time: '20:00', patients: 65 },
        { time: '24:00', patients: 48 },
      ],
      isDemoData: true,
      filters: { from, to },
    }
  }
}

// ═══════════════════════════════════════════════════════════
// 📋 BACKEND ENDPOINTS REQUIRED
// ═══════════════════════════════════════════════════════════

/*
PRIORITY: HIGH

Manager Endpoints:
├── GET /api/branches/:id/stats?from=&to=
├── GET /api/branches/:id/staff
├── GET /api/branches/:id/hourly?from=&to=
└── GET /api/branches/:id/performers?from=&to=

Admin Endpoints:
├── GET /api/network/stats?from=&to=
├── GET /api/network/branches?from=&to=
├── GET /api/network/trends?from=&to=
└── GET /api/network/staff

Utility:
├── GET /api/dashboard/metrics?from=&to=
└── GET /api/dashboard/live-status
*/
