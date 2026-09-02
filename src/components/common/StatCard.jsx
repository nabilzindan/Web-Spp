import React from 'react'

export default function StatCard({ icon: Icon, label, value, delta, deltaPositive = true, accent = 'navy', subtitle }) {
  const accents = {
    navy: 'bg-navy-700 text-white dark:bg-navy-600',
    gold: 'bg-gold-500 text-navy-950 dark:bg-gold-400 dark:text-navy-950',
    emerald: 'bg-emerald-600 text-white dark:bg-emerald-500',
    rose: 'bg-rose-600 text-white dark:bg-rose-500',
    sky: 'bg-sky-600 text-white dark:bg-sky-500',
  }
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-card ring-1 ring-navy-950/5 dark:ring-white/10 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-navy-950 dark:text-white">{value}</p>
          {subtitle && <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-xs ${accents[accent] || accents.navy}`}>
          <Icon size={20} />
        </div>
      </div>
      {delta && (
        <p className={`mt-3 text-xs font-bold flex items-center gap-1 ${
          deltaPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}>
          {deltaPositive ? '▲' : '▼'} {delta}
        </p>
      )}
    </div>
  )
}
