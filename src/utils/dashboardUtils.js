/**
 * Dashboard Utilities
 * Functions for data processing, formatting, and calculations
 */

// Format time in minutes to readable format
export const formatTime = (minutes) => {
  if (!minutes) return '0m'
  return `${minutes.toFixed(1)}m`
}

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (!previous) return 0
  return (((current - previous) / previous) * 100).toFixed(1)
}

// Get performance level based on metrics
export const getPerformanceLevel = (value, threshold) => {
  if (value <= threshold * 0.8) return { level: 'excellent', color: 'emerald' }
  if (value <= threshold) return { level: 'good', color: 'cyan' }
  if (value <= threshold * 1.2) return { level: 'average', color: 'amber' }
  return { level: 'poor', color: 'red' }
}

// Generate performance radar data
export const generatePerformanceData = (metrics) => {
  return [
    {
      category: 'Speed',
      value: Math.min(Math.max((12 - parseFloat(metrics?.avg_service_time || 0)) / 12 * 100, 0), 100),
      benchmark: 80
    },
    {
      category: 'Efficiency',
      value: Math.min(Math.max((parseInt(metrics?.total_patients || 0) / 24) * 100, 0), 100),
      benchmark: 75
    },
    {
      category: 'Quality',
      value: Math.min((parseFloat(metrics?.rating || 0) * 20), 100),
      benchmark: 90
    },
    {
      category: 'Accuracy',
      value: parseInt(metrics?.total_patients || 0) > 0 
        ? Math.min((parseInt(metrics?.identified || 0) / parseInt(metrics?.total_patients)) * 100, 100)
        : 0,
      benchmark: 95
    },
    {
      category: 'Satisfaction',
      value: 92,
      benchmark: 90
    }
  ]
}

// Format currency
export const formatCurrency = (value, currency = 'AED') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value)
}

// Format large numbers
export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Get status badge color and text
export const getStatusBadge = (status) => {
  const badges = {
    completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Completed' },
    in_service: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Service' },
    waiting: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Waiting' },
    pending: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Pending' }
  }
  return badges[status] || badges.pending
}

// Calculate KPI growth
export const calculateKPIGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0
  const growth = ((current - previous) / previous) * 100
  return growth.toFixed(1)
}

// Parse and validate API response
export const parseApiResponse = (response) => {
  if (!response) return null
  if (response.data) return response.data
  return response
}

// Generate time series data for charts
export const generateTimeSeries = (startHour = 8, endHour = 18) => {
  const data = []
  for (let i = startHour; i <= endHour; i++) {
    data.push({
      time: `${i}:00`,
      patients: Math.floor(Math.random() * 15) + 5,
      serviceTime: Math.floor(Math.random() * 6) + 2,
      waitingTime: Math.floor(Math.random() * 8) + 2
    })
  }
  return data
}

// Calculate summary statistics
export const calculateStatistics = (data) => {
  if (!data || data.length === 0) return {
    sum: 0,
    average: 0,
    min: 0,
    max: 0,
    median: 0
  }

  const sorted = [...data].sort((a, b) => a - b)
  const sum = sorted.reduce((acc, val) => acc + val, 0)
  const average = sum / sorted.length
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  return {
    sum: sum.toFixed(2),
    average: average.toFixed(2),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: median.toFixed(2)
  }
}

// Export data to CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  const headers = Object.keys(data[0] || {})
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

// Color utilities for data visualization
export const chartColors = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  light: '#e2e8f0',
  dark: '#1e293b'
}

// Get color based on value and thresholds
export const getValueColor = (value, type = 'performance') => {
  const thresholds = {
    performance: [
      { max: 50, color: '#ef4444' },
      { max: 75, color: '#f59e0b' },
      { max: 100, color: '#10b981' }
    ],
    time: [
      { max: 3, color: '#10b981' },
      { max: 6, color: '#f59e0b' },
      { max: 100, color: '#ef4444' }
    ]
  }

  const threshold = thresholds[type] || thresholds.performance
  return threshold.find(t => value <= t.max)?.color || '#64748b'
}

// Format date to readable format
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Calculate working hours between two times
export const calculateWorkingHours = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end - start
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours.toFixed(2)
}
