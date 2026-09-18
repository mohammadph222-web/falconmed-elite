const API_URL = import.meta.env.VITE_API_URL || 'https://falconmed-backend.onrender.com/api'

const DEMO_DATA = {
  stats: {
    total_patients: '234',
    identified: '230',
    unidentified: '4',
    avg_service_time: '20.00',
    avg_waiting_time: '2.50',
    serve_rate: '98.50',
    staff_count: '5'
  },
  hourly: [
    { time: '08:00', patients: 12 },
    { time: '09:00', patients: 24 },
    { time: '10:00', patients: 35 },
    { time: '11:00', patients: 42 },
    { time: '12:00', patients: 38 },
    { time: '13:00', patients: 31 },
    { time: '14:00', patients: 28 },
    { time: '15:00', patients: 24 },
    { time: '16:00', patients: 19 },
    { time: '17:00', patients: 14 }
  ],
  performers: [
    { staff_name: 'Ahmed Hassan', patients_served: 45, avg_service_time: 18, rating: 4.8 },
    { staff_name: 'Sara Mohammed', patients_served: 42, avg_service_time: 19, rating: 4.7 },
    { staff_name: 'Omar Ali', patients_served: 38, avg_service_time: 21, rating: 4.6 },
    { staff_name: 'Fatima Khalid', patients_served: 36, avg_service_time: 20, rating: 4.5 },
    { staff_name: 'Karim Saleh', patients_served: 33, avg_service_time: 22, rating: 4.4 }
  ],
  alerts: [
    { 
      title: 'High Wait Time Detected', 
      message: 'Average wait time in Branch 1 exceeded 5 minutes during peak hours', 
      severity: 'medium',
      timestamp: new Date().toISOString()
    },
    {
      title: 'Low Staff Availability',
      message: 'Only 2 pharmacists on duty while queue has 15+ patients',
      severity: 'high',
      timestamp: new Date().toISOString()
    },
    {
      title: 'System Performance Normal',
      message: 'All systems operating within normal parameters',
      severity: 'low',
      timestamp: new Date().toISOString()
    }
  ],
  branches: [
    { 
      name: 'Branch 1 - Main', 
      total_patients: 1800, 
      identified: 1765, 
      serve_rate: 98.1, 
      avg_service_time: 20.5, 
      staff_count: 5, 
      status: 'Active',
      waiting_patients: 8,
      avg_waiting_time: 4.2
    },
    { 
      name: 'Branch 2 - Al Ain', 
      total_patients: 1650, 
      identified: 1628, 
      serve_rate: 98.7, 
      avg_service_time: 19.2, 
      staff_count: 4, 
      status: 'Active',
      waiting_patients: 5,
      avg_waiting_time: 3.1
    },
    { 
      name: 'Branch 3 - Khalifa', 
      total_patients: 1920, 
      identified: 1892, 
      serve_rate: 98.5, 
      avg_service_time: 21.3, 
      staff_count: 5, 
      status: 'Active',
      waiting_patients: 12,
      avg_waiting_time: 5.6
    },
    { 
      name: 'Branch 4 - Mafraq', 
      total_patients: 1750, 
      identified: 1721, 
      serve_rate: 98.3, 
      avg_service_time: 20.1, 
      staff_count: 4, 
      status: 'Active',
      waiting_patients: 6,
      avg_waiting_time: 3.8
    },
    { 
      name: 'Branch 5 - Startup', 
      total_patients: 1750, 
      identified: 1750, 
      serve_rate: 100.0, 
      avg_service_time: 18.9, 
      staff_count: 5, 
      status: 'Active',
      waiting_patients: 3,
      avg_waiting_time: 2.1
    }
  ],
  trends: [
    { date: '2026-08-22', patients: 980, identified: 960, served: 968 },
    { date: '2026-08-23', patients: 1050, identified: 1030, served: 1038 },
    { date: '2026-08-24', patients: 1120, identified: 1095, served: 1105 },
    { date: '2026-08-25', patients: 1280, identified: 1250, served: 1268 },
    { date: '2026-08-26', patients: 1450, identified: 1420, served: 1432 },
    { date: '2026-08-27', patients: 1200, identified: 1175, served: 1190 },
    { date: '2026-08-28', patients: 1450, identified: 1420, served: 1438 },
    { date: '2026-08-29', patients: 1670, identified: 1640, served: 1655 }
  ],
  staff: [
    { 
      staff_name: 'Ahmed Hassan', 
      branch_name: 'Branch 1 - Main', 
      patients_served: 125, 
      avg_service_time: 18.5, 
      rating: 4.9,
      shift: 'Morning',
      performance: 'Excellent'
    },
    { 
      staff_name: 'Fatima Ali', 
      branch_name: 'Branch 2 - Al Ain', 
      patients_served: 118, 
      avg_service_time: 19.2, 
      rating: 4.8,
      shift: 'Morning',
      performance: 'Excellent'
    },
    { 
      staff_name: 'Mohammed Amin', 
      branch_name: 'Branch 3 - Khalifa', 
      patients_served: 115, 
      avg_service_time: 20.1, 
      rating: 4.7,
      shift: 'Afternoon',
      performance: 'Very Good'
    },
    { 
      staff_name: 'Sara Mohammed', 
      branch_name: 'Branch 4 - Mafraq', 
      patients_served: 108, 
      avg_service_time: 19.8, 
      rating: 4.6,
      shift: 'Morning',
      performance: 'Very Good'
    },
    { 
      staff_name: 'Omar Khalid', 
      branch_name: 'Branch 5 - Startup', 
      patients_served: 102, 
      avg_service_time: 18.9, 
      rating: 4.8,
      shift: 'Afternoon',
      performance: 'Excellent'
    },
    { 
      staff_name: 'Layla Hassan', 
      branch_name: 'Branch 1 - Main', 
      patients_served: 98, 
      avg_service_time: 21.2, 
      rating: 4.5,
      shift: 'Evening',
      performance: 'Good'
    },
    { 
      staff_name: 'Karim Saleh', 
      branch_name: 'Branch 2 - Al Ain', 
      patients_served: 95, 
      avg_service_time: 20.5, 
      rating: 4.4,
      shift: 'Afternoon',
      performance: 'Good'
    },
    { 
      staff_name: 'Noor Ibrahim', 
      branch_name: 'Branch 3 - Khalifa', 
      patients_served: 92, 
      avg_service_time: 22.1, 
      rating: 4.3,
      shift: 'Evening',
      performance: 'Good'
    },
    { 
      staff_name: 'Zainab Ahmed', 
      branch_name: 'Branch 4 - Mafraq', 
      patients_served: 88, 
      avg_service_time: 21.8, 
      rating: 4.2,
      shift: 'Morning',
      performance: 'Satisfactory'
    },
    { 
      staff_name: 'Rashid Ali', 
      branch_name: 'Branch 5 - Startup', 
      patients_served: 85, 
      avg_service_time: 20.3, 
      rating: 4.1,
      shift: 'Evening',
      performance: 'Satisfactory'
    }
  ],
  livePatients: [
    { id: 1, name: 'Patient A', arrival_time: '09:15', service_time: 5, status: 'In Service', service_type: 'Consultation' },
    { id: 2, name: 'Patient B', arrival_time: '09:22', service_time: 0, status: 'Waiting', service_type: 'Medication' },
    { id: 3, name: 'Patient C', arrival_time: '09:28', service_time: 0, status: 'Waiting', service_type: 'Consultation' },
    { id: 4, name: 'Patient D', arrival_time: '09:35', service_time: 0, status: 'Waiting', service_type: 'Vaccination' }
  ]
}

async function fetchWithTimeout(url, options = {}) {
  const timeout = options.timeout || 60000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    console.log(`📡 API Request: ${url}`)
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw error
  }
}

// ========== PHARMACIST ENDPOINTS ==========

export async function getStats(userId) {
  try {
    console.log(`🔄 [getStats] Fetching for user: ${userId}`)
    const response = await fetchWithTimeout(`${API_URL}/dashboard/stats/${userId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getStats] Success:', data)
    return { success: true, data: data.data || DEMO_DATA.stats }
  } catch (error) {
    console.warn('⚠️ [getStats] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ بدل إخفاؤه
  }
}

export async function getLivePatients() {
  try {
    console.log('🔄 [getLivePatients] Fetching...')
    const response = await fetchWithTimeout(`${API_URL}/dashboard/live-patients`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getLivePatients] Success:', data)
    return { success: true, data: data.data || DEMO_DATA.livePatients }
  } catch (error) {
    console.warn('⚠️ [getLivePatients] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

export async function getHourlyData(userId) {
  try {
    console.log(`🔄 [getHourlyData] Fetching for user: ${userId}`)
    const response = await fetchWithTimeout(`${API_URL}/dashboard/hourly/${userId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getHourlyData] Success:', data)
    return { success: true, data: data.data || DEMO_DATA.hourly }
  } catch (error) {
    console.warn('⚠️ [getHourlyData] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

// ========== MANAGER ENDPOINTS ==========

export async function getBranchStats(branchId, dateFrom, dateTo) {
  try {
    console.log(`🔄 [getBranchStats] Branch ${branchId} from ${dateFrom} to ${dateTo}`)
    const response = await fetchWithTimeout(`${API_URL}/branches/${branchId}/stats?from=${dateFrom}&to=${dateTo}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getBranchStats] Success:', data)
    return { success: true, data: data.data || DEMO_DATA.stats }
  } catch (error) {
    console.warn('⚠️ [getBranchStats] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

export async function getBranchPerformers(options = {}) {
  try {
    const { branchId, from, to, limit = 5 } = options
    console.log(`🔄 [getBranchPerformers] Branch ${branchId}, limit: ${limit}`)
    
    let url = `${API_URL}/branches/${branchId}/performers`
    const params = []
    if (from) params.push(`from=${from}`)
    if (to) params.push(`to=${to}`)
    if (limit) params.push(`limit=${limit}`)
    if (params.length) url += '?' + params.join('&')
    
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getBranchPerformers] Success:', data)
    return { success: true, data: data.data || DEMO_DATA.performers }
  } catch (error) {
    console.warn('⚠️ [getBranchPerformers] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

export async function getBranchHourly(branchId, dateFrom, dateTo) {
  try {
    console.log(`🔄 [getBranchHourly] Branch ${branchId} from ${dateFrom} to ${dateTo}`)
    const response = await fetchWithTimeout(`${API_URL}/branches/${branchId}/hourly?from=${dateFrom}&to=${dateTo}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getBranchHourly] Success:', data)
    return { success: true, data: data.data || { hourly: DEMO_DATA.hourly } }
  } catch (error) {
    console.warn('⚠️ [getBranchHourly] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

export async function getBranchAlerts(branchId) {
  try {
    console.log(`🔄 [getBranchAlerts] Branch ${branchId}`)
    const response = await fetchWithTimeout(`${API_URL}/branches/${branchId}/alerts`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getBranchAlerts] Success:', data)
    return { success: true, data: data.data || { alerts: DEMO_DATA.alerts } }
  } catch (error) {
    console.warn('⚠️ [getBranchAlerts] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

// ========== ADMIN ENDPOINTS ==========

export async function getNetworkStats(dateFrom, dateTo) {
  try {
    console.log(`🔄 [getNetworkStats] From ${dateFrom} to ${dateTo}`)
    const response = await fetchWithTimeout(`${API_URL}/network/stats?from=${dateFrom}&to=${dateTo}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getNetworkStats] Success:', data)
    return { success: true, data: data.data || DEMO_DATA.stats }
  } catch (error) {
    console.warn('⚠️ [getNetworkStats] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

export async function getNetworkBranches(dateFrom, dateTo) {
  try {
    console.log(`🔄 [getNetworkBranches] From ${dateFrom} to ${dateTo}`)
    const response = await fetchWithTimeout(`${API_URL}/network/branches?from=${dateFrom}&to=${dateTo}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getNetworkBranches] Success:', data)
    return { success: true, data: data.data || { branches: DEMO_DATA.branches } }
  } catch (error) {
    console.warn('⚠️ [getNetworkBranches] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

export async function getNetworkTrends(dateFrom, dateTo, granularity = 'daily') {
  try {
    console.log(`🔄 [getNetworkTrends] ${granularity} from ${dateFrom} to ${dateTo}`)
    const response = await fetchWithTimeout(`${API_URL}/network/trends?from=${dateFrom}&to=${dateTo}&granularity=${granularity}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getNetworkTrends] Success:', data)
    return { success: true, data: data.data || { trends: DEMO_DATA.trends } }
  } catch (error) {
    console.warn('⚠️ [getNetworkTrends] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

export async function getNetworkStaff(dateFrom, dateTo, limit = 10) {
  try {
    console.log(`🔄 [getNetworkStaff] From ${dateFrom} to ${dateTo}, limit: ${limit}`)
    const response = await fetchWithTimeout(`${API_URL}/network/staff?from=${dateFrom}&to=${dateTo}&limit=${limit}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ [getNetworkStaff] Success:', data)
    return { success: true, data: data.data || DEMO_DATA.staff }
  } catch (error) {
    console.warn('⚠️ [getNetworkStaff] Error:', error.message)
    throw error  // ✅ ارمِ الخطأ
  }
}

// ========== UTILITY FUNCTIONS ==========

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(time) {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateTrend(current, previous) {
  if (!previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function getStatusColor(status) {
  const colors = {
    'Active': 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    'Inactive': 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    'Warning': 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    'Critical': 'bg-red-500/20 border-red-500/30 text-red-400'
  }
  return colors[status] || colors.Inactive
}

export default {
  getStats,
  getLivePatients,
  getHourlyData,
  getBranchStats,
  getBranchPerformers,
  getBranchHourly,
  getBranchAlerts,
  getNetworkStats,
  getNetworkBranches,
  getNetworkTrends,
  getNetworkStaff,
  formatDate,
  formatTime,
  calculateTrend,
  getStatusColor
}
