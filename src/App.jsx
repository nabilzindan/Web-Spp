import React, { useState } from 'react'
import { useAuth } from './context/AuthContext'
import LoginPage from './components/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'

import AdminDashboard from './components/dashboard/AdminDashboard'
import TUDashboard from './components/dashboard/TUDashboard'
import ParentDashboard from './components/dashboard/ParentDashboard'
import StudentDashboard from './components/dashboard/StudentDashboard'
import PrincipalDashboard from './components/dashboard/PrincipalDashboard'

import StudentManagement from './components/students/StudentManagement'
import ClassManagement from './components/classes/ClassManagement'
import SppManagement from './components/spp/SppManagement'
import PaymentPortal from './components/payment/PaymentPortal'
import FinancialReports from './components/reports/FinancialReports'

export default function App() {
  const { user, loading } = useAuth()
  const [active, setActive] = useState('dashboard')

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-400">
        Memuat...
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <DashboardLayout active={active} onNavigate={setActive}>
      {renderScreen(user.role, active, setActive)}
    </DashboardLayout>
  )
}

function renderScreen(role, active, setActive) {
  if (active === 'dashboard') {
    if (role === 'admin') return <AdminDashboard />
    if (role === 'tu') return <TUDashboard />
    if (role === 'ortu') return <ParentDashboard onGoToPayment={() => setActive('payment')} />
    if (role === 'siswa') return <StudentDashboard />
    if (role === 'kepsek') return <PrincipalDashboard />
  }
  if (active === 'students') return <StudentManagement />
  if (active === 'classes') return <ClassManagement />
  if (active === 'spp') return <SppManagement />
  if (active === 'payment') return <PaymentPortal />
  if (active === 'reports') return <FinancialReports />

  return <AdminDashboard />
}
