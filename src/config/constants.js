// ═══════════════════════════════════════════════════════════
//  FalconMed - Constants
// ═══════════════════════════════════════════════════════════

export const USER_IDS = {
  PHARMACIST: 'ph_001',
  MANAGER: 'ph_005',
  ADMIN: 'ph_005',
}

export const BRANCHES = [
  { id: 1, name: 'Main Branch', code: 'br_001' },
  { id: 2, name: 'Dusit Branch', code: 'br_002' },
  { id: 3, name: 'Ruwi Branch', code: 'br_003' },
]

export const SERVICE_TYPES = [
  { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { value: 'consultation', label: 'Consultation', icon: '🩺' },
  { value: 'vaccination', label: 'Vaccination', icon: '💉' },
]

export const THRESHOLDS = {
  wait: { good: 5, warning: 15, danger: 30 },
  service: { good: 15, warning: 25, danger: 40 },
}

export const AUTO_REFRESH_MS = 5000