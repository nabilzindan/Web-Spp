import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#1f3a76', '#d9a52e', '#5c85cf']

export default function MethodSplitChart({ data }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-950/5">
      <h3 className="font-display text-base font-bold text-navy-950">Metode Pembayaran</h3>
      <p className="mb-2 text-xs text-slate-500">Distribusi transaksi bulan ini</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
