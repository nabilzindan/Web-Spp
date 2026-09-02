import React, { useMemo, useState } from 'react'
import {
  Wallet,
  CalendarClock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  CreditCard,
  Printer,
  Phone,
  MapPin,
  Building,
} from 'lucide-react'
import StatCard from '../common/StatCard'
import Badge, { statusToBadge } from '../common/Badge'
import AcademicYearMatrix from '../common/AcademicYearMatrix'
import ReceiptModal from '../payment/ReceiptModal'
import { formatIDR, SCHOOL_INFO } from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function ParentDashboard({ onGoToPayment }) {
  const { user } = useAuth()
  const { students, invoices } = useData()
  const [selectedReceiptInv, setSelectedReceiptInv] = useState(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)

  // Find linked student for logged-in parent
  const child = useMemo(() => {
    if (!user) return students[0]
    return (
      students.find((s) => s.parent_id === user.id || s.id === user.student_id) ||
      students[0]
    )
  }, [user, students])

  const childInvoices = useMemo(() => {
    if (!child) return []
    return invoices.filter((i) => i.student_id === child.id)
  }, [child, invoices])

  const unpaidInvoices = childInvoices.filter((i) => i.status !== 'paid')
  const totalDue = unpaidInvoices.reduce((a, i) => a + i.amount, 0)
  const paidCount = childInvoices.filter((i) => i.status === 'paid').length

  const handlePrintReceipt = (inv) => {
    setSelectedReceiptInv(inv)
    setReceiptModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Student & Parent Info Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 p-6 text-white shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-gold-500/20 px-2.5 py-0.5 text-xs font-bold text-gold-300">
                Portal Orang Tua / Wali
              </span>
              <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-xs text-navy-200">
                {child?.scholarship_type || 'Reguler'}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{child?.full_name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-navy-200">
              <p>Kelas: <span className="font-bold text-white">{child?.class_name}</span> ({child?.major || 'RPL'})</p>
              <p>NIS: <span className="font-mono text-white">{child?.nis}</span> • NISN: <span className="font-mono text-white">{child?.nisn || '0061234561'}</span></p>
              <p className="flex items-center gap-1"><MapPin size={12} className="text-gold-400 shrink-0" /> {child?.address || 'Jakarta Pusat'}</p>
              <p className="flex items-center gap-1 font-mono"><CreditCard size={12} className="text-gold-400 shrink-0" /> No. VA: {child?.va_number || `88081${child?.nis}`}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10 text-right space-y-1 min-w-[220px]">
            <p className="text-[11px] text-navy-300 uppercase tracking-wider font-semibold">Wali Murid Terdaftar</p>
            <p className="text-base font-bold text-white">{user?.full_name || child?.parent_name}</p>
            <p className="text-xs text-gold-300 flex items-center justify-end gap-1">
              <Phone size={12} /> {user?.phone || child?.parent_phone || '0812-1000-0004'}
            </p>
            <p className="text-[10px] text-navy-400 pt-1 border-t border-white/10 mt-1">
              Status Akun: Terverifikasi Aktif
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Total Tagihan SPP Aktif"
          value={formatIDR(totalDue)}
          delta={unpaidInvoices.length > 0 ? `${unpaidInvoices.length} bulan belum lunas` : 'Semua lunas'}
          accent={unpaidInvoices.length > 0 ? 'rose' : 'emerald'}
          subtitle={`Tarif bulanan: ${formatIDR(childInvoices[0]?.amount || 375000)}`}
        />
        <StatCard
          icon={CalendarClock}
          label="Tagihan Belum Lunas"
          value={`${unpaidInvoices.length} bulan`}
          accent="gold"
          subtitle="Jatuh tempo tgl 10 setiap bulan"
        />
        <StatCard
          icon={CheckCircle2}
          label="Riwayat Lunas T.A. Ini"
          value={`${paidCount} bulan`}
          accent="emerald"
          subtitle="Tanda terima tersimpan digital"
        />
      </div>

      {/* 12-Month Academic Matrix */}
      <AcademicYearMatrix
        student={child}
        invoices={childInvoices}
        onSelectMonth={onGoToPayment}
      />

      {/* Invoices Detailed Breakdown List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-card ring-1 ring-navy-950/5 dark:ring-white/10 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-navy-950 dark:text-white">
              Rincian Tagihan SPP &amp; Bukti Pembayaran
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tahun Ajaran 2026/2027 • Rekening Resmi SMKS Jakarta Pusat 1
            </p>
          </div>
          {unpaidInvoices.length > 0 && (
            <button
              onClick={onGoToPayment}
              className="focus-ring flex items-center gap-1.5 rounded-xl bg-navy-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-800 shadow-sm transition"
            >
              Bayar SPP Sekarang <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {childInvoices.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              Belum ada data tagihan SPP untuk ananda.
            </div>
          ) : (
            childInvoices.map((inv) => {
              const b = statusToBadge(inv.status)
              const isPaid = inv.status === 'paid'
              return (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-navy-950 dark:text-white">
                        SPP {inv.period_month} {inv.period_year}
                      </p>
                      {inv.status === 'pending' && (
                        <span className="rounded-md bg-gold-100 dark:bg-gold-950/60 px-2 py-0.5 text-[10px] font-bold text-gold-800 dark:text-gold-300">
                          Menunggu Verifikasi TU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Rincian: SPP Pokok ({formatIDR(inv.base_tuition || inv.amount * 0.75)}) • Lab ({formatIDR(inv.lab_fee || inv.amount * 0.15)}) • OSIS ({formatIDR(inv.osis_fee || inv.amount * 0.1)})
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Jatuh tempo: {inv.due_date} {inv.receipt_no ? `• No Kwitansi: ${inv.receipt_no}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-display text-sm font-bold text-navy-950 dark:text-white">
                        {formatIDR(inv.amount)}
                      </span>
                    </div>
                    <Badge color={b.color}>{b.label}</Badge>
                    {isPaid && (
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(inv)}
                        className="flex items-center gap-1 rounded-lg bg-navy-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-navy-700 dark:text-gold-400 hover:bg-navy-100 dark:hover:bg-slate-700 transition shadow-xs"
                        title="Cetak Kwitansi Pembayaran"
                      >
                        <Printer size={13} /> Cetak Slip
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
          student={child}
        />
      )}
    </div>
  )
}
