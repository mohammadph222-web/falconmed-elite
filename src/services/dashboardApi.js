const API_URL = 'https://falconmed-backend.onrender.com/api'

// Get Metrics from Queue Stats
export const getMetrics = async () => {
  try {
    const response = await fetch(`${API_URL}/queue/stats`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    console.log('✅ Metrics fetched:', data)
    return data.data || data  // تأكد أنك ترجع الـ data بشكل صحيح
  } catch (error) {
    console.error('❌ Error fetching metrics:', error)
    return null
  }
}

// Get Hourly Data
export const getHourlyData = async (branchId) => {
  try {
    const response = await fetch(`${API_URL}/queue/live-patients`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    
    // Transform to hourly format
    const hourly = data.reduce((acc, patient) => {
      const hour = new Date(patient.arrival_time).getHours()
      const existing = acc.find(h => h.hour === hour)
      if (existing) {
        existing.patients += 1
      } else {
        acc.push({ hour, time: `${hour}:00`, patients: 1, avgServiceTime: 3 })
      }
      return acc
    }, [])
    
    console.log('✅ Hourly data fetched:', hourly)
    return hourly
  } catch (error) {
    console.error('❌ Error fetching hourly data:', error)
    return null
  }
}

// Get Live Status
export const getLiveStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/live-status`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    console.log('✅ Live status fetched:', data)
    return data
  } catch (error) {
    console.error('⚠️ Live status not available:', error)
    return null
  }
}

// Get Branch Data
export const getBranchData = async (branchId) => {
  try {
    const response = await fetch(`${API_URL}/queue/stats`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Error fetching branch data:', error)
    return null
  }
}

// Get Top Performers
export const getTopPerformers = async () => {
  try {
    const response = await fetch(`${API_URL}/queue/stats`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('❌ Error fetching top performers:', error)
    return null
  }
}
