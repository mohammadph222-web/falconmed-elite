// ═══════════════════════════════════════════════════════════
//  API Configuration - Works with Actual Backend
// ═══════════════════════════════════════════════════════════

const RAW_URL = import.meta.env.VITE_API_URL || 'https://falconmed-backend.onrender.com'

const CLEAN_URL = String(RAW_URL)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '')

export const API_BASE = `${CLEAN_URL}/api`

if (import.meta.env.DEV) {
  console.log('🌐 API_BASE:', API_BASE)
}