import React, { useState } from 'react'
import { Wallet, Clock3, CheckCircle2, AlertTriangle, Eye, Image as ImageIcon } from 'lucide-react'
import StatCard from '../common/StatCard'
import MonthlyChart from './MonthlyChart'
import DataTable from '../common/DataTable'
import Badge, { statusToBadge } from '../common/Badge'
import PaymentProofModal from '../payment/PaymentProofModal'
import { MOCK_MONTHLY_COLLECTION, formatIDR } from '../../lib/mockData'
import { useData } from '../../context/DataContext'

export default function TUDashboard() {
  const { transactions, verifyPayment } = useData()
  const [selectedProofPayment, setSelectedProofPayment] = useState(null)
  const [proofModalOpen, setProofModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const pendingTransactions = transactions.filter((t) => t.status === 'pending')
  const successToday = transactions.filter((t) => t.status === 'success')
  const totalSuccess = successToday.reduce((a, t) => a + t.amount, 0)
  const failedCount = transactions.filter((t) => t.status === 'failed').length

  const handleOpenProof = (trx) => {
    setSelectedProofPayment(trx)
    setProofModalOpen(true)
  }

  const handleApprove = (id) => {
    verifyPayment(id, 'success')
  }

  const handleReject = (id, reason) => {
    verifyPayment(id, 'failed', reason)
  }

  const filtered = transactions.filter(
    (t) =>
      t.student_name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.reference_code && t.reference_code.toLowerCase().includes(search.toLowerCase())) ||
      (t.sender_name && t.sender_name.toLowerCase().includes(search.toLowerCase()))
  )

  const columns = [
    {
      key: 'id',
      header: 'ID / Ref',
      render: (r) => (
        <div>
          <p className="font-mono font-bold text-navy-950">{r.reference_code || r.id}</p>
          <p className="text-[10px] text-slate-400">{r.paid_at || '—'}</p>
        </div>
      ),
    },
    {
      key: 'student_name',
      header: 'Siswa & Kelas',
      render: (r) => (
        <div>
          <p className="font-semibold text-navy-950">{r.student_name}</p>
          <p className="text-xs text-slate-500">{r.class_name}</p>
        </div>
      ),
    },
    {
      key: 'method',
      header: 'Metode & Pengirim',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.method}</p>
          <p className="text-[11px] text-slate-500">
            {r.sender_name ? `a.n ${r.sender_name} (${r.sender_bank || 'Bank'})` : 'QRIS Langsung'}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Nominal',
      render: (r) => <span className="font-semibold text-navy-950">{formatIDR(r.amount)}</span>,
    },
    {
      key: 'proof',
      header: 'Bukti Struk',
      render: (r) => (
        <button
          onClick={() => handleOpenProof(r)}
          className={`focus-ring flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            r.proof_image_url
              ? 'bg-navy-50 text-navy-700 hover:bg-navy-100'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <ImageIcon size={13} /> {r.proof_image_url ? 'Lihat Bukti' : 'Detail'}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const b = statusToBadge(r.status)
        return <Badge color={b.color}>{b.label}</Badge>
      },
    },
    {
      key: 'action',
      header: 'Verifikasi TU',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleApprove(r.id)}
              className="focus-ring rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              Setujui
            </button>
            <button
              onClick={() => handleOpenProof(r)}
              className="focus-ring rounded-lg bg-rose-50 border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Tolak
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Total Penerimaan Terverifikasi" value={formatIDR(totalSuccess)} accent="navy" />
        <StatCard icon={CheckCircle2} label="Transaksi Sukses" value={`${successToday.length} transaksi`} accent="emerald" />
        <StatCard
          icon={Clock3}
          label="Menunggu Verifikasi"
          value={`${pendingTransactions.length} transaksi`}
          delta={pendingTransactions.length > 0 ? 'Perlu tindakan TU' : 'Semua beres'}
          deltaPositive={pendingTransactions.length === 0}
          accent="gold"
        />
        <StatCard icon={AlertTriangle} label="Transaksi Ditolak/Gagal" value={`${failedCount} transaksi`} accent="rose" />
      </div>

      <MonthlyChart data={MOCK_MONTHLY_COLLECTION} />

      {/* Transaction Verification Table */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-950/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-navy-950">Antrean &amp; Riwayat Verifikasi Transaksi</h3>
            <p className="text-xs text-slate-500">
              Tinjau foto struk bukti pembayaran dari wali murid, lalu lakukan konfirmasi (Setujui / Tolak).
            </p>
          </div>
          {pendingTransactions.length > 0 && (
            <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-800">
              {pendingTransactions.length} transaksi pending
            </span>
          )}
        </div>

        <DataTable columns={columns} rows={filtered} search={search} onSearch={setSearch} />
      </div>

      {/* Payment Proof Preview Modal */}
      <PaymentProofModal
        open={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        payment={selectedProofPayment}
        onApprove={handleApprove}
        onReject={handleReject}
        canVerify={true}
      />
    </div>
  )
}
