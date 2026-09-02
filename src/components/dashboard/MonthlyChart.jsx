import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Line, ComposedChart } from 'recharts'
import { formatIDR } from '../../lib/mockData'

export default function MonthlyChart({ data }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-950/5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-navy-950">Tren Penerimaan SPP</h3>
          <p className="text-xs text-slate-500">Realisasi vs target bulanan (Rp)</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ left: -10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(v / 1_000_000)}jt`}
          />
          <Tooltip
            formatter={(v) => formatIDR(v)}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="terkumpul" name="Terkumpul" fill="#1f3a76" radius={[6, 6, 0, 0]} barSize={22} />
          <Line dataKey="target" name="Target" stroke="#d9a52e" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
