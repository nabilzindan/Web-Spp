import React, { useState } from 'react'
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Users,
  Wallet,
  User,
  BookOpen,
  Presentation,
  ShieldCheck,
  Check,
  Building,
  KeyRound,
  Info,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ThemeSwitcherDropdown } from '../../context/ThemeContext'
import { ROLES, MOCK_USERS } from '../../lib/mockData'

const ROLE_ICONS = {
  admin: Users,
  tu: Wallet,
  ortu: User,
  siswa: BookOpen,
  kepsek: Presentation,
}

export default function LoginPage() {
  const { signInWithPassword, signInAsUser, authError, availableUsers } = useAuth()
  const [identifier, setIdentifier] = useState('admin@smksjp1.sch.id')
  const [password, setPassword] = useState('123456')
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('staf')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await signInWithPassword(identifier, password)
    setSubmitting(false)
  }

  const handleSelectQuickAccount = (account) => {
    setIdentifier(account.email)
    signInAsUser(account)
  }

  const staffAccounts = availableUsers.filter((u) => ['admin', 'tu', 'kepsek'].includes(u.role))
  const parentAccounts = availableUsers.filter((u) => u.role === 'ortu')
  const studentAccounts = availableUsers.filter((u) => u.role === 'siswa')

  const currentCategoryAccounts =
    selectedCategory === 'staf'
      ? staffAccounts
      : selectedCategory === 'ortu'
      ? parentAccounts
      : studentAccounts

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left Brand Panel */}
      <div className="relative hidden overflow-hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between lg:p-12 text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-navy-700/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />

        {/* Top Header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500 text-navy-950 shadow-md">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-wide">SPP PORTAL</p>
              <p className="text-xs font-semibold text-gold-400">SMKS Jakarta Pusat 1</p>
            </div>
          </div>
        </div>

        {/* Informative Center Box */}
        <div className="relative max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-gold-300 backdrop-blur">
            <ShieldCheck size={14} /> Terintegrasi, Aman &amp; Akuntabel
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Portal Administrasi &amp; Pembayaran SPP Resmi.
          </h2>
          <p className="text-sm leading-relaxed text-navy-200">
            Sistem informasi pembayaran SPP terpadu untuk SMKS Jakarta Pusat 1 dengan dukungan multi-peran, verifikasi struk otomatis, integrasi QRIS, dan aksesibilitas tema lengkap.
          </p>

          <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-navy-200">
            <div className="rounded-xl bg-white/5 p-3 border border-white/10">
              <p className="text-gold-400 font-bold">NPSN: 20100123</p>
              <p className="text-[11px] text-navy-300 mt-0.5">Akreditasi A • Kurikulum Merdeka</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 border border-white/10">
              <p className="text-gold-400 font-bold">3 Jurusan Kejuruan</p>
              <p className="text-[11px] text-navy-300 mt-0.5">RPL • TKJ • Akuntansi</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative border-t border-navy-800/80 pt-4 text-xs text-navy-400 flex items-center justify-between">
          <p>© {new Date().getFullYear()} SMKS Jakarta Pusat 1. Semua hak dilindungi.</p>
          <p className="font-mono text-[11px] text-gold-400/80">v2.0 • Jakarta Pusat</p>
        </div>
      </div>

      {/* Right Form & Account Selector Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 relative">
        {/* Top Right Theme Switcher */}
        <div className="absolute top-5 right-5 z-20">
          <ThemeSwitcherDropdown />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-gold-400">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="font-display text-base font-bold text-navy-950 dark:text-white">SPP Portal</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">SMKS Jakarta Pusat 1</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-navy-950 dark:text-white">Masuk ke Portal SPP</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Gunakan email, username peran (contoh: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-navy-900 dark:text-gold-400 font-semibold">admin</code>), atau NIS Anda.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email / Username / NIS
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@smksjp1.sch.id / 23101001"
                  className="input pl-9 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Bebas / Default: 123456
                </span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-9 text-xs"
                />
              </div>
            </div>

            {authError && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs font-medium text-rose-700 dark:text-rose-300 animate-in fade-in">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-navy-700 py-3 text-xs font-bold text-white transition hover:bg-navy-800 disabled:opacity-60 shadow-sm"
            >
              {submitting ? 'Memverifikasi…' : 'Masuk Sekarang'} <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Account Switcher Section */}
          <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Pilih Akun Terdaftar
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Klik untuk langsung masuk</span>
            </div>

            {/* Category Tabs */}
            <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 mb-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedCategory('staf')}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  selectedCategory === 'staf'
                    ? 'bg-white dark:bg-slate-700 text-navy-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy-950'
                }`}
              >
                Staf ({staffAccounts.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('ortu')}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  selectedCategory === 'ortu'
                    ? 'bg-white dark:bg-slate-700 text-navy-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy-950'
                }`}
              >
                Orang Tua ({parentAccounts.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('siswa')}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  selectedCategory === 'siswa'
                    ? 'bg-white dark:bg-slate-700 text-navy-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy-950'
                }`}
              >
                Siswa ({studentAccounts.length})
              </button>
            </div>

            {/* Account Cards List */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {currentCategoryAccounts.map((account) => {
                const Icon = ROLE_ICONS[account.role] || User
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleSelectQuickAccount(account)}
                    className="focus-ring group flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-left transition hover:border-navy-500 hover:bg-navy-50/50 dark:hover:bg-slate-800/80 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-100 dark:bg-slate-800 text-navy-800 dark:text-gold-400 group-hover:bg-navy-700 group-hover:text-white transition">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-navy-950 dark:text-slate-100 truncate group-hover:text-navy-700 dark:group-hover:text-gold-400">
                          {account.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                          {account.email} {account.nis ? `• NIS: ${account.nis}` : ''}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{account.description}</p>
                      </div>
                    </div>

                    <span className="shrink-0 ml-2 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:bg-navy-700 group-hover:text-white transition">
                      Masuk →
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
