import React, { useState, useMemo } from 'react'
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  X,
  Phone,
  UserCheck,
  Calendar,
  Printer,
  ShieldCheck,
  CreditCard,
  Building,
} from 'lucide-react'
import Modal from '../common/Modal'
import Badge, { statusToBadge } from '../common/Badge'
import ReceiptModal from '../payment/ReceiptModal'
import { formatIDR } from '../../lib/mockData'
import { useData } from '../../context/DataContext'

export default function ClassStudentsModal({ open, onClose, classData }) {
  const { students, invoices } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState(null)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)

  const classStudents = useMemo(() => {
    if (!classData) return []
    return students.filter((s) => s.class_id === classData.id || s.class_name === classData.name)
  }, [students, classData])

  const studentRows = useMemo(() => {
    return classStudents.map((student) => {
      const studentInvoices = invoices.filter((i) => i.student_id === student.id)
      const latestInvoice = studentInvoices[0] || null

      let paymentStatus = 'unpaid'
      if (latestInvoice) {
        paymentStatus = latestInvoice.status
      }

      return {
        ...student,
        latestInvoice,
        paymentStatus,
        allInvoices: studentInvoices,
      }
    })
  }, [classStudents, invoices])

  const filtered = useMemo(() => {
    return studentRows.filter((s) => {
      const matchSearch =
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.nis.includes(search) ||
        (s.nisn && s.nisn.includes(search)) ||
        (s.parent_name && s.parent_name.toLowerCase().includes(search.toLowerCase())) ||
        (s.scholarship_type && s.scholarship_type.toLowerCase().includes(search.toLowerCase()))

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && s.paymentStatus === 'paid') ||
        (statusFilter === 'unpaid' && (s.paymentStatus === 'unpaid' || s.paymentStatus === 'overdue')) ||
        (statusFilter === 'pending' && s.paymentStatus === 'pending')

      return matchSearch && matchStatus
    })
  }, [studentRows, search, statusFilter])

  const handleOpenReceipt = (s) => {
    setSelectedStudentForReceipt(s)
    setReceiptModalOpen(true)
  }

  if (!classData) return null

  const total = studentRows.length
  const paidCount = studentRows.filter((s) => s.paymentStatus === 'paid').length
  const pendingCount = studentRows.filter((s) => s.paymentStatus === 'pending').length
  const unpaidCount = studentRows.filter((s) => s.paymentStatus === 'unpaid' || s.paymentStatus === 'overdue').length
  const compliancePct = total > 0 ? Math.round((paidCount / total) * 100) : 0

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Detail Rombel & Daftar Siswa — Kelas ${classData.name}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5">
          {/* Class Overview Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 p-5 text-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-gold-500/20 px-2.5 py-0.5 text-xs font-bold text-gold-300">
                    Tingkat {classData.grade_level}
                  </span>
                  <span className="text-xs text-navy-300">• {classData.major || 'Semua Jurusan'}</span>
                  {classData.room && <span className="text-xs text-navy-400">• Ruang: {classData.room}</span>}
                </div>
                <h3 className="mt-1 font-display text-xl font-bold">{classData.name}</h3>
                <p className="mt-0.5 text-xs text-navy-300">
                  Wali Kelas: <span className="font-semibold text-white">{classData.homeroom_teacher}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-navy-300">Kepatuhan SPP September 2026</p>
                <p className="font-display text-2xl font-bold text-gold-400">{compliancePct}%</p>
                <p className="text-[11px] text-navy-400">{paidCount} dari {total} siswa lunas</p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-white/5 p-2.5 backdrop-blur border border-white/5">
                <p className="text-[11px] text-navy-300">Total Murid Terdaftar</p>
                <p className="text-base font-bold text-white">{total} Siswa</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 backdrop-blur border border-emerald-500/20">
                <p className="text-[11px] text-emerald-300">Sudah Lunas</p>
                <p className="text-base font-bold text-emerald-400">{paidCount} Siswa</p>
              </div>
              <div className="rounded-xl bg-gold-500/10 p-2.5 backdrop-blur border border-gold-500/20">
                <p className="text-[11px] text-gold-300">Verifikasi Pending</p>
                <p className="text-base font-bold text-gold-400">{pendingCount} Siswa</p>
              </div>
              <div className="rounded-xl bg-rose-500/10 p-2.5 backdrop-blur border border-rose-500/20">
                <p className="text-[11px] text-rose-300">Belum Bayar / Menunggak</p>
                <p className="text-base font-bold text-rose-400">{unpaidCount} Siswa</p>
              </div>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIS, NISN, wali, atau beasiswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === 'all'
                    ? 'bg-navy-700 text-white dark:bg-navy-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Semua ({total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === 'paid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Lunas ({paidCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === 'pending'
                    ? 'bg-gold-500 text-navy-950 shadow-xs'
                    : 'bg-gold-50 dark:bg-gold-950/40 text-gold-800 dark:text-gold-300 hover:bg-gold-100'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unpaid')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === 'unpaid'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                }`}
              >
                Belum ({unpaidCount})
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Identitas Siswa</th>
                    <th className="px-4 py-3">Orang Tua / Kontak</th>
                    <th className="px-4 py-3">Status Beasiswa</th>
                    <th className="px-4 py-3">Tagihan SPP</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                        Tidak ada data siswa yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s, idx) => {
                      const badge = statusToBadge(s.paymentStatus)
                      return (
                        <tr key={s.id} className="hover:bg-navy-50/30 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-navy-950 dark:text-white">{s.full_name}</p>
                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              NIS: {s.nis} {s.nisn ? `• NISN: ${s.nisn}` : ''}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{s.parent_name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone size={10} /> {s.parent_phone || '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                s.scholarship_type === 'Penerima KJP Plus'
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                  : s.scholarship_type === 'Beasiswa Prestasi'
                                  ? 'bg-gold-100 text-gold-900 dark:bg-gold-950/60 dark:text-gold-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {s.scholarship_type || 'Reguler'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {s.latestInvoice ? (
                              <div>
                                <p className="font-bold text-navy-950 dark:text-white">
                                  {formatIDR(s.latestInvoice.amount)}
                                </p>
                                <p className="text-[10px] text-slate-400">Tempo: {s.latestInvoice.due_date}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge color={badge.color}>{badge.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.paymentStatus === 'paid' ? (
                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(s)}
                                className="inline-flex items-center gap-1 rounded-lg bg-navy-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-navy-700 dark:text-gold-400 hover:bg-navy-100 dark:hover:bg-slate-700 transition"
                                title="Cetak Kwitansi SPP"
                              >
                                <Printer size={13} /> Kwitansi
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Belum lunas</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Menampilkan {filtered.length} dari {total} siswa terdaftar di kelas {classData.name}</span>
            <button
              onClick={onClose}
              className="focus-ring rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Kwitansi Modal */}
      {selectedStudentForReceipt && (
        <ReceiptModal
          open={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          invoice={selectedStudentForReceipt.latestInvoice}
          student={selectedStudentForReceipt}
        />
      )}
    </>
  )
}
