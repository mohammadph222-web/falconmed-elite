import { useState, useEffect, useCallback } from 'react'
import * as dashboardApiModule from '../services/dashboardApi'

const { getMetrics, getHourlyData, getLiveStatus } = dashboardApiModule

/**
 * Custom Hook for Dashboard Data Management
 * Handles data fetching, caching, and state management
 */
export const useDashboardData = (dateFrom, dateTo) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.time('Dashboard Data Fetch')
      
      // Parallel requests for better performance
      const [metricsResponse, hourlyResponse, liveStatusResponse] = await Promise.all([
        getMetrics(),
        getHourlyData(1),
        getLiveStatus()
      ])

      const metrics = metricsResponse?.data || metricsResponse || null
      const hourly = hourlyResponse?.data || hourlyResponse || []
      const liveStatus = liveStatusResponse?.data || liveStatusResponse || null

      setData({
        metrics,
        hourly,
        liveStatus,
        timestamp: new Date().toISOString()
      })

      setLastUpdated(new Date())
      console.timeEnd('Dashboard Data Fetch')
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData()
  }, [dateFrom, dateTo, fetchData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
    isRefreshing: loading
  }
}

/**
 * Custom Hook for Dashboard Metrics Calculations
 */
export const useDashboardMetrics = (rawMetrics) => {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    if (!rawMetrics) return

    const processedMetrics = {
      totalPatients: parseInt(rawMetrics?.total_patients) || 0,
      identified: parseInt(rawMetrics?.identified) || 0,
      unidentified: parseInt(rawMetrics?.unidentified) || 0,
      inService: parseInt(rawMetrics?.in_service) || 0,
      waiting: parseInt(rawMetrics?.waiting) || 0,
      avgServiceTime: parseFloat(rawMetrics?.avg_service_time) || 0,
      avgWaitingTime: parseFloat(rawMetrics?.avg_waiting_time) || 0,
      maxWaitingTime: parseFloat(rawMetrics?.max_waiting_time) || 0,
      minWaitingTime: parseFloat(rawMetrics?.min_waiting_time) || 0,
      rating: parseFloat(rawMetrics?.rating) || 0,
      
      // Calculated fields
      identificationRate: rawMetrics?.total_patients > 0 
        ? (parseInt(rawMetrics?.identified) / parseInt(rawMetrics?.total_patients)) * 100 
        : 0,
      serviceTimeStatus: parseFloat(rawMetrics?.avg_service_time) <= 4 ? 'excellent' : 'normal',
      waitingTimeStatus: parseFloat(rawMetrics?.avg_waiting_time) <= 5 ? 'good' : 'poor'
    }

    setMetrics(processedMetrics)
  }, [rawMetrics])

  return metrics
}

/**
 * Custom Hook for Dashboard Filters
 */
export const useDashboardFilters = (initialFrom, initialTo) => {
  const [dateFrom, setDateFrom] = useState(initialFrom)
  const [dateTo, setDateTo] = useState(initialTo)
  const [viewMode, setViewMode] = useState('overview')
  const [selectedBranch, setSelectedBranch] = useState('all')

  const resetFilters = () => {
    setDateFrom(initialFrom)
    setDateTo(initialTo)
    setViewMode('overview')
    setSelectedBranch('all')
  }

  return {
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    viewMode,
    setViewMode,
    selectedBranch,
    setSelectedBranch,
    resetFilters
  }
}

/**
 * Custom Hook for Real-time Updates
 */
export const useDashboardRealtime = (enabled = true) => {
  const [isLive, setIsLive] = useState(enabled)
  const [updateCount, setUpdateCount] = useState(0)

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setUpdateCount(prev => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [isLive])

  return {
    isLive,
    setIsLive,
    updateCount
  }
}

/**
 * Custom Hook for Performance Monitoring
 */
export const useDashboardPerformance = (data) => {
  const [performanceMetrics, setPerformanceMetrics] = useState(null)

  useEffect(() => {
    if (!data) return

    const metrics = {
      speedScore: calculateSpeedScore(data.metrics?.avg_service_time),
      efficiencyScore: calculateEfficiencyScore(data.metrics?.total_patients),
      qualityScore: calculateQualityScore(data.metrics?.rating),
      accuracyScore: calculateAccuracyScore(
        data.metrics?.identified,
        data.metrics?.total_patients
      ),
      overallScore: 0
    }

    metrics.overallScore = (
      metrics.speedScore +
      metrics.efficiencyScore +
      metrics.qualityScore +
      metrics.accuracyScore
    ) / 4

    setPerformanceMetrics(metrics)
  }, [data])

  return performanceMetrics
}

// Helper functions
const calculateSpeedScore = (avgServiceTime) => {
  const time = parseFloat(avgServiceTime) || 0
  if (time <= 3) return 100
  if (time <= 5) return 80
  if (time <= 7) return 60
  return Math.max(0, 40 - (time - 7) * 5)
}

const calculateEfficiencyScore = (totalPatients) => {
  const patients = parseInt(totalPatients) || 0
  if (patients >= 30) return 100
  if (patients >= 20) return 80
  if (patients >= 10) return 60
  return (patients / 10) * 60
}

const calculateQualityScore = (rating) => {
  const r = parseFloat(rating) || 0
  return Math.min((r / 5) * 100, 100)
}

const calculateAccuracyScore = (identified, total) => {
  const i = parseInt(identified) || 0
  const t = parseInt(total) || 0
  if (t === 0) return 0
  const rate = (i / t) * 100
  if (rate >= 95) return 100
  if (rate >= 90) return 80
  if (rate >= 85) return 60
  return Math.max(0, rate * 0.6)
}
