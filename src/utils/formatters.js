// ═══════════════════════════════════════════════════════════
//  Formatters
// ═══════════════════════════════════════════════════════════

import { THRESHOLDS } from '../config/constants'

export const formatMinutes = (value) => {
  const v = Number(value)
  if (!Number.isFinite(v) || v < 0) return '0m'
  if (v < 60) return `${Math.round(v)}m`
  const h = Math.floor(v / 60)
  const m = Math.round(v % 60)
  return `${h}h ${m}m`
}

export const formatNumber = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('en-US')
}

export const formatPercent = (value, decimals = 1) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0%'
  return `${n.toFixed(decimals)}%`
}

export const formatTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getWaitColor = (minutes) => {
  const m = Number(minutes) || 0
  if (m < THRESHOLDS.wait.good) return 'text-emerald-400'
  if (m < THRESHOLDS.wait.warning) return 'text-amber-400'
  return 'text-red-400'
}