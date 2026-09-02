import React, { useMemo, useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  User,
  Printer,
  Calendar,
  CreditCard,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import Badge, { statusToBadge } from '../common/Badge'
import AcademicYearMatrix from '../common/AcademicYearMatrix'
import ReceiptModal from '../payment/ReceiptModal'
import { formatIDR } from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { students, invoices } = useData()
  const [selectedReceiptInv, setSelectedReceiptInv] = useState(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)

  const me = useMemo(() => {
    if (!user) return students[0]
    return students.find((s) => s.user_id === user.id || s.id === user.student_id) || students[0]
  }, [user, students])

  const myInvoices = useMemo(() => {
    if (!me) return []
    return invoices.filter((i) => i.student_id === me.id)
  }, [me, invoices])

  const latestInvoice = myInvoices[0]
  const isCurrentMonthPaid = latestInvoice?.status === 'paid'
  const isCurrentMonthPending = latestInvoice?.status === 'pending'

  const handlePrintReceipt = (inv) => {
    setSelectedReceiptInv(inv)
    setReceiptModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Student Profile Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-card ring-1 ring-navy-950/5 dark:ring-white/10 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-navy-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-navy-800 dark:text-gold-400">
                Portal Siswa Aktif
              </span>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {me?.scholarship_type || 'Reguler'}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-950 dark:text-white">{me?.full_name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
              <p>Kelas: <span className="font-bold text-slate-800 dark:text-slate-200">{me?.class_name}</span> ({me?.major || 'RPL'})</p>
              <p>NIS: <span className="font-mono text-slate-800 dark:text-slate-200">{me?.nis}</span> • NISN: <span className="font-mono text-slate-800 dark:text-slate-200">{me?.nisn || '0061234561'}</span></p>
              <p className="flex items-center gap-1"><MapPin size={12} className="text-gold-500 shrink-0" /> {me?.address || 'Jakarta Pusat'}</p>
              <p className="flex items-center gap-1 font-mono"><CreditCard size={12} className="text-gold-500 shrink-0" /> No. VA: {me?.va_number || `88081${me?.nis}`}</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 rounded-2xl px-5 py-4 border shrink-0 ${
              isCurrentMonthPaid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : isCurrentMonthPending
                ? 'bg-gold-50 dark:bg-gold-950/40 text-gold-800 dark:text-gold-300 border-gold-200 dark:border-gold-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {isCurrentMonthPaid ? (
              <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : isCurrentMonthPending ? (
              <Clock size={28} className="text-gold-600 dark:text-gold-400 shrink-0" />
            ) : (
              <XCircle size={28} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">
                {isCurrentMonthPaid
                  ? 'SPP Bulan Ini Lunas'
                  : isCurrentMonthPending
                  ? 'Menunggu Verifikasi TU'
                  : 'SPP Bulan Ini Belum Dibayar'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isCurrentMonthPaid
                  ? 'Terima kasih atas kedisiplinannya'
                  : isCurrentMonthPending
                  ? 'Bukti transfer sedang diperiksa oleh Bendahara'
                  : 'Silakan koordinasikan dengan orang tua/wali Anda'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Academic Matrix */}
      <AcademicYearMatrix student={me} invoices={myInvoices} />

      {/* Payment History Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-card ring-1 ring-navy-950/5 dark:ring-white/10 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <h3 className="font-display text-base font-bold text-navy-950 dark:text-white">
          Riwayat Pembayaran &amp; Kwitansi SPP
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Tahun Ajaran 2026/2027 • Anda dapat mengunduh bukti kwitansi resmi untuk bulan yang telah lunas
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {myInvoices.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              Belum ada riwayat tagihan SPP.
            </div>
          ) : (
            myInvoices.map((inv) => {
              const b = statusToBadge(inv.status)
              const isPaid = inv.status === 'paid'
              return (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-navy-950 dark:text-white">
                        SPP {inv.period_month} {inv.period_year}
                      </p>
                      {inv.status === 'pending' && (
                        <span className="rounded bg-gold-100 dark:bg-gold-950/60 px-1.5 py-0.5 text-[10px] font-bold text-gold-800 dark:text-gold-300">
                          Menunggu Verifikasi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jatuh tempo: {inv.due_date} {inv.receipt_no ? `• No Kwitansi: ${inv.receipt_no}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {formatIDR(inv.amount)}
                    </span>
                    <Badge color={b.color}>{b.label}</Badge>
                    {isPaid && (
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(inv)}
                        className="flex items-center gap-1 rounded-lg bg-navy-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-navy-700 dark:text-gold-400 hover:bg-navy-100 dark:hover:bg-slate-700 transition"
                      >
                        <Printer size={13} /> Kwitansi
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Kwitansi Modal */}
      {selectedReceiptInv && (
        <ReceiptModal
          open={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          invoice={selectedReceiptInv}
          student={me}
        />
      )}
    </div>
  )
}
