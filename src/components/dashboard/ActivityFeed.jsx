import React from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

const ICONS = {
  success: { icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-100' },
  info: { icon: Info, className: 'text-navy-700 bg-navy-100' },
  error: { icon: XCircle, className: 'text-rose-600 bg-rose-100' },
}

export default function ActivityFeed({ items }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-950/5">
      <h3 className="font-display text-base font-bold text-navy-950">Aktivitas Terbaru</h3>
      <ul className="mt-4 space-y-4">
        {items.map((item) => {
          const meta = ICONS[item.type] || ICONS.info
          const Icon = meta.icon
          return (
            <li key={item.id} className="flex gap-3">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.className}`}>
                <Icon size={15} />
              </div>
              <div>
                <p className="text-sm text-slate-700">{item.text}</p>
                <p className="text-xs text-slate-400">{item.time}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
