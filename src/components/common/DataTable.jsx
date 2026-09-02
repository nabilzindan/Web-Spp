import React from 'react'
import { Search } from 'lucide-react'

export default function DataTable({ columns, rows, search, onSearch, filters, emptyLabel = 'Tidak ada data' }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-card ring-1 ring-navy-950/5 dark:ring-white/10 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {(onSearch || filters) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50 dark:bg-slate-900/50">
          {onSearch && (
            <div className="relative w-full sm:max-w-xs">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Cari data..."
                className="input pl-9 text-xs"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 whitespace-nowrap">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-slate-500 dark:text-slate-500">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-navy-50/40 dark:hover:bg-slate-800/50 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-middle text-slate-800 dark:text-slate-300">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
