// ═══════════════════════════════════════════════════════════
//  API Layer - FINAL v2
//  Real + Demo endpoints with unified signatures
// ═══════════════════════════════════════════════════════════

const API_URL =
  import.meta.env.VITE_API_URL || 'https://falconmed-backend.onrender.com/api'

// ═══════════════════════════════════════════════════════════
//  Internal Helper
// ═══════════════════════════════════════════════════════════

const apiRequest = async (endpoint, options = {}) => {
  const { signal } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  // دمج الـ signals: إذا مُرّر signal خارجي، نربطه بالـ controller
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    })

    clearTimeout(timeoutId)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const json = await response.json()
    if (json?.success === false) {
      throw new Error(json.message || 'Request failed')
    }
    return json
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

const buildParams = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value)
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

// ═══════════════════════════════════════════════════════════
// ✅ REAL ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * ✅ GET /api/queue/stats
 * Returns: { success, data: { total_patients, identified, unidentified,
 *          avg_service_time, avg_waiting_time, in_service, waiting } }
 */
export const getStats = async (from = '', to = '', { signal } = {}) => {
  const query = buildParams({ from, to })
  return apiRequest(`/queue/stats${query}`, { signal })
}

/**
 * ✅ GET /api/queue/live-patients
 */
export const getLivePatients = async ({ signal } = {}) => {
  return apiRequest('/queue/live-patients', { signal })
}

/**
 * ✅ GET /api/dashboard/hourly/:userId
 */
export const getHourlyData = async (userId, { from = '', to = '', signal } = {}) => {
  const query = buildParams({ from, to })
  return apiRequest(`/dashboard/hourly/${userId || 1}${query}`, { signal })
}

// ═══════════════════════════════════════════════════════════
// ⚠️ DEMO ENDPOINTS
// TODO: Backend must add these endpoints
// ═══════════════════════════════════════════════════════════

/**
 * ⚠️ DEMO — GET /api/dashboard/metrics
 *
 * Returns: { data: { total_patients, identified, unidentified,
 *          avg_service_time, avg_waiting_time, serve_rate },
 *          isDemoData: true }
 */
export const getMetrics = async (from = '', to = '', { signal } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/dashboard/metrics${query}`, { signal })
    // إذا وصل رد حقيقي، نضيف flag فقط إذا لم يكن موجوداً
    return { ...result, isDemoData: result?.isDemoData ?? false }
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
    }
  }
}

/**
 * ⚠️ DEMO — GET /api/branches/:id/stats
 *
 * @param {string|number} branchId
 * @param {string} from
 * @param {string} to
 * @param {{ signal?: AbortSignal }} options
 */
export const getBranchStats = async (
  branchId,
  from = '',
  to = '',
  { signal } = {}
) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(
      `/branches/${branchId}/stats${query}`,
      { signal }
    )
    return { ...result, isDemoData: result?.isDemoData ?? false }
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
    }
  }
}

/**
 * ⚠️ DEMO — GET /api/branches/:id/performers
 *
 * @param {Object} options
 * @param {string|number} [options.branchId]
 * @param {string} [options.from]
 * @param {string} [options.to]
 * @param {number} [options.limit=5]
 * @param {AbortSignal} [options.signal]
 */
export const getTopPerformers = async ({
  branchId,
  from = '',
  to = '',
  limit = 5,
  signal,
} = {}) => {
  try {
    const query = buildParams({ branchId, from, to, limit })
    const result = await apiRequest(`/branches/${branchId}/performers${query}`, {
      signal,
    })
    return { ...result, isDemoData: result?.isDemoData ?? false }
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
      data: allPerformers.slice(0, limit),
      isDemoData: true,
      filters: { branchId, from, to, limit },
    }
  }
}

/**
 * ⚠️ DEMO — GET /api/network/stats
 *
 * NOTE: No real network-wide data yet.
 * We return pure DEMO values (no × 5 multiplication).
 */
export const getNetworkStats = async (from = '', to = '', { signal } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/stats${query}`, { signal })
    return { ...result, isDemoData: result?.isDemoData ?? false }
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
      sourceNote: 'Demo data only — real network endpoint not yet available.',
    }
  }
}

/**
 * ⚠️ DEMO — GET /api/network/branches
 */
export const getBranches = async (from = '', to = '', { signal } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/branches${query}`, { signal })
    return { ...result, isDemoData: result?.isDemoData ?? false }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.warn('⚠️ Branches DEMO — endpoint missing')
    return {
      data: [
        { id: 1, name: 'Main Branch',     patients: 1774, rate: 99.3, staff: 5, status: 'Excellent' },
        { id: 2, name: 'Al Ain Branch',   patients: 1650, rate: 98.9, staff: 5, status: 'Excellent' },
        { id: 3, name: 'Khalifa Branch',  patients: 1542, rate: 98.6, staff: 4, status: 'Good' },
        { id: 4, name: 'Mafraq Branch',   patients: 1489, rate: 98.5, staff: 4, status: 'Good' },
        { id: 5, name: 'Startup Branch',  patients: 1260, rate: 98.3, staff: 3, status: 'Good' },
      ],
      isDemoData: true,
    }
  }
}

/**
 * ⚠️ DEMO — GET /api/network/trends
 */
export const getNetworkTrends = async (from = '', to = '', { signal } = {}) => {
  try {
    const query = buildParams({ from, to })
    const result = await apiRequest(`/network/trends${query}`, { signal })
    return { ...result, isDemoData: result?.isDemoData ?? false }
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
└── GET /api/branches/:id/performers?from=&to=&limit=

Admin Endpoints:
├── GET /api/network/stats?from=&to=            ← CRITICAL
├── GET /api/network/branches?from=&to=
├── GET /api/network/trends?from=&to=
└── GET /api/network/staff

Utility:
├── GET /api/dashboard/metrics?from=&to=
└── GET /api/dashboard/live-status
*/