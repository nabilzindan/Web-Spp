import React, { useMemo, useState } from 'react'
import { FileSpreadsheet, FileText, Download, CheckCircle2, Eye, Image as ImageIcon, Wallet, Receipt, XCircle } from 'lucide-react'
import DataTable from '../common/DataTable'
import Badge, { statusToBadge } from '../common/Badge'
import StatCard from '../common/StatCard'
import PaymentProofModal from '../payment/PaymentProofModal'
import { formatIDR } from '../../lib/mockData'
import { useData } from '../../context/DataContext'

const STATUS_OPTIONS = ['all', 'success', 'pending', 'failed']
const METHOD_OPTIONS = ['all', 'QRIS', 'Virtual Account BCA', 'Virtual Account Mandiri', 'Transfer Bank']

export default function FinancialReports() {
  const { transactions } = useData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [method, setMethod] = useState('all')
  const [exporting, setExporting] = useState(null)
  const [exportedMsg, setExportedMsg] = useState('')
  const [selectedProofPayment, setSelectedProofPayment] = useState(null)
  const [proofModalOpen, setProofModalOpen] = useState(false)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.student_name.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        (t.reference_code && t.reference_code.toLowerCase().includes(search.toLowerCase())) ||
        (t.sender_name && t.sender_name.toLowerCase().includes(search.toLowerCase()))
      
      const matchStatus = status === 'all' || t.status === status
      const matchMethod = method === 'all' || t.method.toLowerCase().includes(method.toLowerCase())
      return matchSearch && matchStatus && matchMethod
    })
  }, [transactions, search, status, method])

  const totalSuccess = filtered.filter((t) => t.status === 'success').reduce((a, t) => a + t.amount, 0)
  const totalPending = filtered.filter((t) => t.status === 'pending').length
  const totalFailed = filtered.filter((t) => t.status === 'failed').length

  const exportAs = (type) => {
    setExporting(type)
    setExportedMsg('')
    setTimeout(() => {
      setExporting(null)
      setExportedMsg(`laporan-keuangan-spp-${Date.now()}.${type === 'pdf' ? 'pdf' : 'xlsx'} berhasil diekspor.`)
    }, 1200)
  }

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
    { key: 'method', header: 'Metode' },
    {
      key: 'sender_name',
      header: 'Pengirim',
      render: (r) => r.sender_name || '—',
    },
    { key: 'amount', header: 'Nominal', render: (r) => <span className="font-semibold text-navy-950">{formatIDR(r.amount)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const b = statusToBadge(r.status)
        return <Badge color={b.color}>{b.label}</Badge>
      },
    },
    {
      key: 'proof',
      header: 'Bukti',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedProofPayment(r)
            setProofModalOpen(true)
          }}
          className="focus-ring flex items-center gap-1 rounded-lg bg-navy-50 px-2 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-100"
        >
          <ImageIcon size={13} /> {r.proof_image_url ? 'Lihat' : 'Detail'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Total Penerimaan SPP" value={formatIDR(totalSuccess)} accent="navy" />
        <StatCard icon={Receipt} label="Menunggu Konfirmasi" value={`${totalPending} transaksi`} accent="gold" />
        <StatCard icon={XCircle} label="Transaksi Gagal / Ditolak" value={`${totalFailed} transaksi`} accent="rose" />
      </div>

      {/* Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-navy-950">Laporan Transaksi Pembayaran</h3>
          <p className="text-xs text-slate-500">Filter, audit, dan ekspor data pembayaran seluruh siswa</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportAs('pdf')}
            disabled={!!exporting}
            className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-navy-300 hover:text-navy-900 disabled:opacity-60 shadow-xs"
          >
            {exporting === 'pdf' ? <Download size={14} className="animate-bounce" /> : <FileText size={14} />}
            Ekspor PDF
          </button>
          <button
            onClick={() => exportAs('excel')}
            disabled={!!exporting}
            className="focus-ring flex items-center gap-1.5 rounded-xl bg-navy-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-60 shadow-xs"
          >
            {exporting === 'excel' ? <Download size={14} className="animate-bounce" /> : <FileSpreadsheet size={14} />}
            Ekspor Excel (.xlsx)
          </button>
        </div>
      </div>

      {exportedMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-200 animate-in fade-in">
          <CheckCircle2 size={16} /> {exportedMsg}
        </div>
      )}

      {/* Transactions Data Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        search={search}
        onSearch={setSearch}
        filters={
          <>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="focus-ring rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'Semua Status' : statusToBadge(s).label}
                </option>
              ))}
            </select>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="focus-ring rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
            >
              {METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m === 'all' ? 'Semua Metode' : m}
                </option>
              ))}
            </select>
          </>
        }
      />

      {/* Proof Modal */}
      <PaymentProofModal
        open={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        payment={selectedProofPayment}
        canVerify={false}
      />
    </div>
  )
}
