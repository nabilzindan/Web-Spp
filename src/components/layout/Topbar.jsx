import React, { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, Bell, CheckCheck, Trash2, Clock, CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import Badge from '../common/Badge'
import { ROLES } from '../../lib/mockData'
import { useData } from '../../context/DataContext'
import { ThemeSwitcherDropdown } from '../../context/ThemeContext'

const titleByKey = {
  dashboard: 'Dashboard',
  students: 'Data Siswa',
  classes: 'Data Kelas',
  spp: 'Nominal SPP',
  payment: 'Bayar SPP',
  reports: 'Laporan Keuangan',
}

const NOTIF_ICONS = {
  success: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' },
  warning: { icon: AlertCircle, color: 'text-gold-500 bg-gold-50 dark:bg-gold-950/50' },
  error: { icon: AlertCircle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' },
  info: { icon: Info, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50' },
}

export default function Topbar({ user, active, onOpenMobile, onSignOut, onNavigate }) {
  const roleMeta = ROLES[user.role]
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } = useData()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [filterTab, setFilterTab] = useState('all')
  const popoverRef = useRef(null)

  const userNotifications = notifications.filter(
    (n) => n.recipient_role === 'all' || n.recipient_role === user.role || n.recipient_id === user.id
  )

  const unreadCount = userNotifications.filter((n) => !n.is_read).length

  const displayedNotifications = userNotifications.filter((n) => {
    if (filterTab === 'unread') return !n.is_read
    return true
  })

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [popoverOpen])

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 transition-colors duration-200">
      <button onClick={onOpenMobile} className="focus-ring rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden">
        <Menu size={20} />
      </button>

      <div>
        <h1 className="font-display text-lg font-bold text-navy-950 dark:text-white">{titleByKey[active] || 'Dashboard'}</h1>
        <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
          SMKS Jakarta Pusat 1 • Tahun Ajaran 2026/2027
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Theme Switcher */}
        <ThemeSwitcherDropdown />

        {/* Notification Bell & Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen((prev) => !prev)}
            className={`focus-ring relative grid h-9 w-9 place-items-center rounded-full transition ${
              popoverOpen
                ? 'bg-navy-100 text-navy-700 dark:bg-slate-800 dark:text-gold-400'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown */}
          {popoverOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 z-50">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-navy-950 dark:text-white">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead(user.role, user.id)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-navy-700 dark:text-gold-400 hover:bg-navy-50 dark:hover:bg-slate-800"
                      title="Tandai semua dibaca"
                    >
                      <CheckCheck size={14} /> Baca Semua
                    </button>
                  )}
                  {userNotifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                      title="Bersihkan notifikasi"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-3 py-1.5 text-xs">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    filterTab === 'all'
                      ? 'bg-white dark:bg-slate-700 text-navy-950 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-navy-950'
                  }`}
                >
                  Semua ({userNotifications.length})
                </button>
                <button
                  onClick={() => setFilterTab('unread')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    filterTab === 'unread'
                      ? 'bg-white dark:bg-slate-700 text-navy-950 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-navy-950'
                  }`}
                >
                  Belum Dibaca ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
                {displayedNotifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    <Bell className="mx-auto mb-2 opacity-30" size={28} />
                    Tidak ada notifikasi {filterTab === 'unread' ? 'baru' : ''}.
                  </div>
                ) : (
                  displayedNotifications.map((n) => {
                    const iconConfig = NOTIF_ICONS[n.type] || NOTIF_ICONS.info
                    const IconComponent = iconConfig.icon
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id)
                          if (n.link && onNavigate) {
                            onNavigate(n.link)
                            setPopoverOpen(false)
                          }
                        }}
                        className={`group flex items-start gap-3 p-3.5 transition cursor-pointer ${
                          n.is_read
                            ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            : 'bg-navy-50/40 dark:bg-slate-800/40 hover:bg-navy-50/70 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${iconConfig.color}`}>
                          <IconComponent size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs ${n.is_read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'font-bold text-navy-950 dark:text-white'}`}>
                              {n.title}
                            </p>
                            {!n.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {n.time}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(n.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-0.5 transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Pemberitahuan otomatis dari sistem SPP Portal
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="text-right">
          <p className="text-xs font-bold text-navy-950 dark:text-white">{user.full_name}</p>
          <Badge color={roleMeta.color}>{roleMeta.label}</Badge>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="focus-ring grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:text-slate-400 transition"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
