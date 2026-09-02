import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout({ active, onNavigate, children }) {
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role={user.role}
        active={active}
        onNavigate={(k) => {
          onNavigate(k)
          setMobileOpen(false)
        }}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar user={user} active={active} onOpenMobile={() => setMobileOpen(true)} onSignOut={signOut} onNavigate={onNavigate} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
