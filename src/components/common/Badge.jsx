import React from 'react'

const STYLES = {
  navy: 'bg-navy-100 text-navy-700 ring-navy-300 border border-navy-200',
  gold: 'bg-amber-100 text-amber-800 ring-amber-300 border border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-300 border border-emerald-200 badge-emerald',
  sky: 'bg-sky-100 text-sky-700 ring-sky-300 border border-sky-200',
  violet: 'bg-violet-100 text-violet-700 ring-violet-300 border border-violet-200',
  rose: 'bg-rose-100 text-rose-700 ring-rose-300 border border-rose-200 badge-rose',
  slate: 'bg-slate-100 text-slate-700 ring-slate-300 border border-slate-200',
}

const ICONS_BY_STATUS = {
  paid: '✓ ',
  success: '✓ ',
  pending: '⏳ ',
  unpaid: '○ ',
  overdue: '✕ ',
  failed: '✕ ',
  aktif: '✓ ',
  nonaktif: '— ',
}

export default function Badge({ children, color = 'slate', className = '', showSymbol = false, statusKey = '' }) {
  const symbol = showSymbol || statusKey ? (ICONS_BY_STATUS[statusKey] || '') : ''
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
        STYLES[color] || STYLES.slate
      } ${className}`}
    >
      {symbol && <span className="font-mono text-[11px] opacity-90">{symbol}</span>}
      {children}
    </span>
  )
}

export function statusToBadge(status) {
  const map = {
    paid: { label: 'Lunas', color: 'emerald', symbol: '✓ ' },
    success: { label: 'Berhasil / Lunas', color: 'emerald', symbol: '✓ ' },
    unpaid: { label: 'Belum Bayar', color: 'slate', symbol: '○ ' },
    pending: { label: 'Menunggu Verifikasi', color: 'gold', symbol: '⏳ ' },
    overdue: { label: 'Jatuh Tempo', color: 'rose', symbol: '✕ ' },
    failed: { label: 'Ditolak / Gagal', color: 'rose', symbol: '✕ ' },
    aktif: { label: 'Aktif', color: 'emerald', symbol: '✓ ' },
    nonaktif: { label: 'Non-aktif', color: 'slate', symbol: '— ' },
  }
  return map[status] || { label: status, color: 'slate', symbol: '' }
}
