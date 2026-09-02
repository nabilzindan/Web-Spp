import React, { useState } from 'react'
import { CheckCircle2, Clock, XCircle, FileText, Printer } from 'lucide-react'
import { ACADEMIC_MONTHS, formatIDR } from '../../lib/mockData'
import ReceiptModal from '../payment/ReceiptModal'

export default function AcademicYearMatrix({ student, invoices = [], onSelectMonth }) {
  const [selectedReceiptData, setSelectedReceiptData] = useState(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)

  const handleViewReceipt = (inv) => {
    setSelectedReceiptData({
      invoice: inv,
      student,
    })
    setReceiptModalOpen(true)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h4 className="font-display text-sm font-bold text-navy-950 dark:text-white">
            Matriks Status Pembayaran 12 Bulan (T.A. 2026/2027)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rekapitulasi pembayaran SPP Semester Ganjil &amp; Genap
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={13} /> Lunas
          </span>
          <span className="flex items-center gap-1 text-gold-600 dark:text-gold-400">
            <Clock size={13} /> Pending
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <XCircle size={13} /> Belum
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {ACADEMIC_MONTHS.map((m, idx) => {
          const inv = invoices.find(
            (i) => i.period_month?.toLowerCase() === m.name.toLowerCase() || i.period_month === m.key
          )
          const isPaid = inv?.status === 'paid'
          const isPending = inv?.status === 'pending'
          const isUnpaid = inv?.status === 'unpaid' || inv?.status === 'overdue'
          const isUpcoming = !inv && idx > 2

          return (
            <div
              key={m.key}
              className={`rounded-xl border p-3 flex flex-col justify-between transition ${
                isPaid
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/30'
                  : isPending
                  ? 'border-gold-300 bg-gold-50/50 dark:border-gold-900/60 dark:bg-gold-950/30'
                  : isUnpaid
                  ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/30'
                  : 'border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {m.semester}
                  </span>
                  {isPaid ? (
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                  ) : isPending ? (
                    <Clock size={15} className="text-gold-600 dark:text-gold-400" />
                  ) : isUnpaid ? (
                    <XCircle size={15} className="text-rose-600 dark:text-rose-400" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">—</span>
                  )}
                </div>
                <p className="font-display text-sm font-bold text-navy-950 dark:text-white mt-1">
                  {m.name}
                </p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {inv ? formatIDR(inv.amount) : 'Rp 375.000'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                {isPaid ? (
                  <button
                    type="button"
                    onClick={() => handleViewReceipt(inv)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    <Printer size={11} /> Kwitansi
                  </button>
                ) : isPending ? (
                  <span className="block text-center text-[10px] font-bold text-gold-700 dark:text-gold-300">
                    Verifikasi TU
                  </span>
                ) : isUnpaid ? (
                  <button
                    type="button"
                    onClick={() => onSelectMonth && onSelectMonth(inv)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-navy-700 px-2 py-1 text-[11px] font-bold text-white hover:bg-navy-800"
                  >
                    Bayar
                  </button>
                ) : (
                  <span className="block text-center text-[10px] text-slate-400">
                    Akan Datang
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Kwitansi Modal */}
      {selectedReceiptData && (
        <ReceiptModal
          open={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          invoice={selectedReceiptData.invoice}
          student={selectedReceiptData.student}
        />
      )}
    </div>
  )
}
