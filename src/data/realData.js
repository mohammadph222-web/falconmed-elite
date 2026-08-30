// SADCO Benchmark Data - Real & Realistic Numbers
export const sadcoBenchmarkData = {
  dailyStats: {
    totalTransactions: 1786,
    served: 1774,
    noShow: 12,
    serveRate: 99.3,
    noShowRate: 0.7,
    avgServiceTime: 3.0, // minutes
    avgWaitingTime: 5.08, // minutes
  },
  patientTypes: {
    identified: 1757,
    unidentified: 17,
    identifiedPercent: 98.4,
    unidentifiedPercent: 1.6,
  },
  bookingMethods: {
    mobileBooking: 1718,
    other: 68,
  },
  topEmployees: [
    { id: 1, name: 'LAMA AL-REMIT', patients: 189, rating: 4.9, serviceTime: 2.8 },
    { id: 2, name: 'Hana Bin Eldin', patients: 234, rating: 4.8, serviceTime: 2.9 },
    { id: 3, name: 'Alia Hoot', patients: 227, rating: 4.7, serviceTime: 3.0 },
    { id: 4, name: 'شيماء عبد الله', patients: 215, rating: 4.6, serviceTime: 3.1 },
    { id: 5, name: 'Mohammed Al-Kaabi', patients: 192, rating: 4.8, serviceTime: 2.9 },
  ],
  hourlyDistribution: [
    { time: '07:00-08:00', patients: 45, identified: 44, unidentified: 1 },
    { time: '08:00-09:00', patients: 78, identified: 76, unidentified: 2 },
    { time: '09:00-10:00', patients: 92, identified: 90, unidentified: 2 },
    { time: '10:00-11:00', patients: 108, identified: 105, unidentified: 3 },
    { time: '11:00-12:00', patients: 115, identified: 112, unidentified: 3 },
    { time: '12:00-13:00', patients: 98, identified: 96, unidentified: 2 },
    { time: '13:00-14:00', patients: 88, identified: 86, unidentified: 2 },
    { time: '14:00-15:00', patients: 102, identified: 100, unidentified: 2 },
    { time: '15:00-16:00', patients: 142, identified: 138, unidentified: 4 }, // Peak
    { time: '16:00-17:00', patients: 138, identified: 134, unidentified: 4 }, // Peak
  ],
  alertThresholds: {
    waitingTime: 5.0, // minutes - alert if exceeds
    serviceTime: 4.0, // minutes - alert if exceeds
    noShowRate: 1.0, // % - alert if exceeds
    serveRate: 98.0, // % - alert if below
  },
  quickInsights: [
    { label: 'Identified Patients', value: 1757, icon: '✓', color: 'text-green-600' },
    { label: 'Unidentified Patients', value: 17, icon: '?', color: 'text-orange-600' },
    { label: 'Mobile Bookings', value: 1718, icon: '📱', color: 'text-blue-600' },
    { label: 'Peak Hour (15:00-16:00)', value: '142 patients', icon: '📊', color: 'text-purple-600' },
  ],
}

// Pharmacist-level data (individual performance)
export const generatePharmacistData = (pharmacistId) => {
  const employee = sadcoBenchmarkData.topEmployees.find(e => e.id === pharmacistId) || sadcoBenchmarkData.topEmployees[0]
  
  return {
    name: employee.name,
    totalPatients: employee.patients,
    identified: Math.round(employee.patients * 0.98),
    unidentified: employee.patients - Math.round(employee.patients * 0.98),
    avgServiceTime: employee.serviceTime,
    avgWaitingTime: 4.8,
    rating: employee.rating,
    serveRate: 99.1,
    noShowRate: 0.9,
  }
}

// Branch-level data (all employees in one branch)
export const generateBranchData = (branchId) => {
  const branchMultiplier = 1 // Could vary per branch
  return {
    branchId,
    totalPatients: Math.round(1774 * branchMultiplier),
    identified: Math.round(1757 * branchMultiplier),
    unidentified: Math.round(17 * branchMultiplier),
    avgServiceTime: 3.0,
    avgWaitingTime: 5.08,
    serveRate: 99.3,
    noShowRate: 0.7,
    employees: sadcoBenchmarkData.topEmployees,
    hourlyData: sadcoBenchmarkData.hourlyDistribution,
  }
}

// Admin-level data (all branches)
export const generateNetworkData = () => {
  const branches = [
    { name: 'Main Branch', id: 'br_001' },
    { name: 'Dusit Branch', id: 'br_002' },
    { name: 'Ruwi Branch', id: 'br_003' },
    { name: 'Qurum Branch', id: 'br_004' },
    { name: 'Seeb Branch', id: 'br_005' },
  ]
  
  return {
    totalPatients: 1774 * 5,
    totalIdentified: 1757 * 5,
    totalUnidentified: 17 * 5,
    avgServiceTime: 3.0,
    avgWaitingTime: 5.08,
    avgServeRate: 99.3,
    avgNoShowRate: 0.7,
    branches: branches.map(b => ({
      ...b,
      patients: 1774,
      identified: 1757,
      unidentified: 17,
      serveRate: 99.3 + (Math.random() * 0.4 - 0.2), // slight variation
      employees: sadcoBenchmarkData.topEmployees,
    })),
  }
}

// Alert system
export const checkAlerts = (data) => {
  const alerts = []
  
  if (data.avgWaitingTime > sadcoBenchmarkData.alertThresholds.waitingTime) {
    alerts.push({
      type: 'warning',
      title: 'Waiting Time Alert',
      message: `Average waiting time (${data.avgWaitingTime}m) exceeds threshold (${sadcoBenchmarkData.alertThresholds.waitingTime}m)`,
      severity: 'high',
      action: 'Add more staff or optimize flow',
      notifyManager: true,
    })
  }
  
  if (data.avgServiceTime > sadcoBenchmarkData.alertThresholds.serviceTime) {
    alerts.push({
      type: 'warning',
      title: 'Service Time Alert',
      message: `Average service time (${data.avgServiceTime}m) exceeds threshold (${sadcoBenchmarkData.alertThresholds.serviceTime}m)`,
      severity: 'medium',
      action: 'Review process or add training',
      notifyManager: true,
    })
  }
  
  if (data.noShowRate > sadcoBenchmarkData.alertThresholds.noShowRate) {
    alerts.push({
      type: 'danger',
      title: 'No-Show Rate Alert',
      message: `No-show rate (${data.noShowRate}%) exceeds threshold (${sadcoBenchmarkData.alertThresholds.noShowRate}%)`,
      severity: 'high',
      action: 'Follow up on missed appointments',
      notifyManager: true,
    })
  }
  
  if (data.serveRate < sadcoBenchmarkData.alertThresholds.serveRate) {
    alerts.push({
      type: 'danger',
      title: 'Serve Rate Alert',
      message: `Serve rate (${data.serveRate}%) below threshold (${sadcoBenchmarkData.alertThresholds.serveRate}%)`,
      severity: 'critical',
      action: 'Immediate action required',
      notifyManager: true,
    })
  }
  
  return alerts
}
