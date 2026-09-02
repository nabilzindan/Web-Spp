import React from 'react'
import {
  LayoutDashboard,
  Users,
  School,
  Wallet,
  CreditCard,
  FileBarChart,
  GraduationCap,
  X,
  ShieldCheck,
  Building,
} from 'lucide-react'
import { SCHOOL_INFO } from '../../lib/mockData'

const NAV_BY_ROLE = {
  admin: [
    { key: 'dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
    { key: 'students', label: 'Data Master Siswa', icon: Users },
    { key: 'classes', label: 'Data Rombel & Kelas', icon: School },
    { key: 'spp', label: 'Tarif Nominal SPP', icon: Wallet },
    { key: 'reports', label: 'Laporan & Rekonsiliasi', icon: FileBarChart },
  ],
  tu: [
    { key: 'dashboard', label: 'Dashboard Verifikasi TU', icon: LayoutDashboard },
    { key: 'students', label: 'Data Siswa & Wali', icon: Users },
    { key: 'spp', label: 'Atur Tarif SPP', icon: Wallet },
    { key: 'reports', label: 'Laporan Keuangan SPP', icon: FileBarChart },
  ],
  ortu: [
    { key: 'dashboard', label: 'Dashboard Wali Murid', icon: LayoutDashboard },
    { key: 'payment', label: 'Portal Pembayaran SPP', icon: CreditCard },
  ],
  siswa: [
    { key: 'dashboard', label: 'Dashboard Siswa', icon: LayoutDashboard },
  ],
  kepsek: [
    { key: 'dashboard', label: 'Dashboard Eksekutif', icon: LayoutDashboard },
    { key: 'reports', label: 'Laporan & Audit RAPBS', icon: FileBarChart },
  ],
}

export default function Sidebar({ role, active, onNavigate, mobileOpen, onCloseMobile }) {
  const items = NAV_BY_ROLE[role] || []

  const content = (
    <div className="flex h-full flex-col bg-navy-950 text-white border-r border-navy-900 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-900/70">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-500 text-navy-950 shadow-md">
          <GraduationCap size={24} />
        </div>
        <div className="leading-tight min-w-0">
          <p className="font-display text-sm font-bold tracking-wide">SPP PORTAL</p>
          <p className="text-[11px] text-gold-400 font-semibold truncate">{SCHOOL_INFO.name}</p>
          <p className="text-[10px] text-navy-400">NPSN: {SCHOOL_INFO.npsn}</p>
        </div>
        <button onClick={onCloseMobile} className="ml-auto text-navy-400 hover:text-white lg:hidden">
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-navy-400">
          Menu Navigasi
        </p>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-navy-700 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-navy-200 hover:bg-navy-900 hover:text-white'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-gold-400' : 'text-navy-400'} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* School Info Footer */}
      <div className="border-t border-navy-900/80 p-4 text-[11px] text-navy-300 bg-navy-950/90 space-y-1">
        <div className="flex items-center gap-1.5 text-gold-400 font-bold text-xs">
          <ShieldCheck size={14} /> Terakreditasi A
        </div>
        <p className="text-[10px] text-navy-400 leading-tight">
          {SCHOOL_INFO.alamat}
        </p>
        <p className="text-[10px] text-navy-400">Telp: {SCHOOL_INFO.telepon}</p>
        <p className="text-[10px] text-navy-500 pt-1">© {new Date().getFullYear()} SMKS Jakarta Pusat 1</p>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-64 animate-in slide-in-from-left duration-200">{content}</div>
        </div>
      )}
    </>
  )
}
