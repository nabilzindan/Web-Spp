import React, { useState, useMemo, useRef } from 'react'
import {
  QrCode,
  Landmark,
  Building2,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Mail,
  ArrowLeft,
  Upload,
  Copy,
  Check,
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Info,
} from 'lucide-react'
import {
  SCHOOL_BANK_ACCOUNTS,
  QRIS_CONFIG,
  formatIDR,
} from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

const METHODS = [
  { key: 'qris', label: 'QRIS Resmi Sekolah', icon: QrCode, desc: 'Scan & bayar instan via GoPay, OVO, Dana, BCA, Livin' },
  { key: 'va', label: 'Virtual Account', icon: Landmark, desc: 'BCA, Mandiri, BNI, BRI, Bank DKI' },
  { key: 'transfer', label: 'Transfer Bank Manual', icon: Building2, desc: 'Transfer ke rekening resmi sekolah + upload bukti' },
]

const SAMPLE_PROOFS = [
  { label: 'Struk Mobile Banking (BCA)', url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80' },
  { label: 'Bukti Transfer ATM', url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80' },
  { label: 'Struk e-Wallet / QRIS', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80' },
]

export default function PaymentPortal() {
  const { user } = useAuth()
  const { students, invoices, submitPayment } = useData()

  // Find linked student for this user
  const currentStudent = useMemo(() => {
    if (!user) return students[0]
    if (user.role === 'ortu') {
      return students.find((s) => s.parent_id === user.id || s.id === user.student_id) || students[0]
    }
    if (user.role === 'siswa') {
      return students.find((s) => s.user_id === user.id || s.id === user.student_id) || students[0]
    }
    return students[0]
  }, [user, students])

  // Get unpaid / pending invoices for this student
  const studentInvoices = useMemo(() => {
    if (!currentStudent) return []
    return invoices.filter((i) => i.student_id === currentStudent.id && i.status !== 'paid')
  }, [invoices, currentStudent])

  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [method, setMethod] = useState(null)
  const [selectedBank, setSelectedBank] = useState(SCHOOL_BANK_ACCOUNTS[0].bank)
  const [stage, setStage] = useState('select') // 'select' | 'checkout' | 'processing' | 'success'

  // Proof upload states for VA / Transfer
  const [proofImage, setProofImage] = useState(null) // Data URL or URL string
  const [proofImageName, setProofImageName] = useState('')
  const [senderName, setSenderName] = useState(user?.full_name || '')
  const [senderBank, setSenderBank] = useState('BCA')
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [notified, setNotified] = useState({ wa: false, email: false })
  const [completedTrx, setCompletedTrx] = useState(null)

  const fileInputRef = useRef(null)

  const startCheckout = (inv) => {
    setSelectedInvoice(inv)
    setMethod('qris')
    setProofImage(null)
    setProofImageName('')
    setValidationError('')
    setStage('checkout')
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setValidationError('Harap pilih file gambar (JPG, PNG, atau WebP).')
      return
    }

    setProofImageName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setProofImage(reader.result)
      setValidationError('')
    }
    reader.readAsDataURL(file)
  }

  const handleUseSampleProof = (sample) => {
    setProofImage(sample.url)
    setProofImageName(sample.label)
    setValidationError('')
  }

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Execute payment submission
  const handleProcessPayment = () => {
    setValidationError('')

    // Validation for non-QRIS: must have proof image
    if (method !== 'qris' && !proofImage) {
      setValidationError('Silakan unggah foto/gambar bukti transfer sebelum mengonfirmasi.')
      return
    }

    if (method !== 'qris' && !senderName.trim()) {
      setValidationError('Silakan isi nama pengirim rekening.')
      return
    }

    setStage('processing')

    setTimeout(() => {
      const trx = submitPayment({
        invoice: selectedInvoice,
        method,
        bankName: selectedBank,
        senderName,
        senderBank,
        proofImageUrl: proofImage,
        notes,
      })

      setCompletedTrx(trx)
      setStage('success')

      setTimeout(() => setNotified((n) => ({ ...n, wa: true })), 400)
      setTimeout(() => setNotified((n) => ({ ...n, email: true })), 900)
    }, 1200)
  }

  const finish = () => {
    setSelectedInvoice(null)
    setMethod(null)
    setProofImage(null)
    setStage('select')
    setNotified({ wa: false, email: false })
    setCompletedTrx(null)
  }

  // Selected school bank account object
  const activeBankAccount = SCHOOL_BANK_ACCOUNTS.find((b) => b.bank === selectedBank) || SCHOOL_BANK_ACCOUNTS[0]
  const vaNumber = `88081${currentStudent?.nis || '23101001'}`

  // STAGE 1: INVOICE SELECTION
  if (stage === 'select') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Student Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 p-6 text-white shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gold-300">Data Murid / Ananda</p>
              <h2 className="font-display text-xl font-bold">{currentStudent?.full_name}</h2>
              <p className="text-xs text-navy-200 mt-0.5">
                {currentStudent?.class_name} • NIS: <span className="font-mono">{currentStudent?.nis}</span>
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur">
              <p className="text-[11px] text-navy-200">Wali Murid</p>
              <p className="text-sm font-semibold">{currentStudent?.parent_name || 'Orang Tua'}</p>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-navy-950">Tagihan SPP yang Belum Dibayar</h3>
            <span className="text-xs font-semibold text-slate-500">{studentInvoices.length} tagihan</span>
          </div>

          {studentInvoices.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-navy-950/5">
              <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={44} />
              <p className="font-display text-lg font-bold text-navy-950">Semua Tagihan SPP Telah Lunas!</p>
              <p className="text-sm text-slate-500 mt-1">Tidak ada tagihan SPP yang tertunggak saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {studentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-950/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">
                        SPP {inv.period_month} {inv.period_year}
                      </span>
                      {inv.status === 'pending' ? (
                        <span className="rounded-lg bg-gold-100 px-2.5 py-1 text-[11px] font-bold text-gold-800">
                          Menunggu Verifikasi
                        </span>
                      ) : inv.status === 'overdue' ? (
                        <span className="rounded-lg bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800">
                          Jatuh Tempo
                        </span>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          Belum Bayar
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-slate-500">Jatuh Tempo: {inv.due_date}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-navy-950">{formatIDR(inv.amount)}</p>
                  </div>

                  <button
                    onClick={() => startCheckout(inv)}
                    className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-700 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 shadow-sm"
                  >
                    {inv.status === 'pending' ? 'Upload Ulang Bukti Bayar' : 'Bayar Sekarang'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // STAGE 2: CHECKOUT & PAYMENT METHOD
  if (stage === 'checkout') {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button
          onClick={() => setStage('select')}
          className="focus-ring flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-700"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Tagihan
        </button>

        {/* Invoice Summary Card */}
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-950/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tagihan Pembayaran</p>
            <h3 className="font-display text-base font-bold text-navy-950">
              SPP {selectedInvoice?.period_month} {selectedInvoice?.period_year}
            </h3>
            <p className="text-xs text-slate-400">
              {currentStudent?.full_name} ({currentStudent?.class_name})
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Nominal</p>
            <p className="font-display text-2xl font-bold text-navy-950">{formatIDR(selectedInvoice?.amount)}</p>
          </div>
        </div>

        {/* Method Picker */}
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-950/5 space-y-4">
          <h4 className="text-sm font-bold text-navy-950">1. Pilih Metode Pembayaran</h4>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {METHODS.map((m) => {
              const Icon = m.icon
              const isActive = method === m.key
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMethod(m.key)
                    setValidationError('')
                  }}
                  className={`focus-ring flex flex-col items-start rounded-xl border p-4 text-left transition ${
                    isActive
                      ? 'border-navy-700 bg-navy-50/70 shadow-xs ring-1 ring-navy-700'
                      : 'border-slate-200 hover:border-navy-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${isActive ? 'bg-navy-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon size={18} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-navy-950">{m.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">{m.desc}</p>
                </button>
              )
            })}
          </div>

          {/* METHOD 1: QRIS */}
          {method === 'qris' && (
            <div className="mt-4 rounded-2xl border border-navy-200 bg-slate-50/80 p-5 animate-in fade-in">
              <div className="flex flex-col items-center text-center">
                {/* QRIS Header */}
                <div className="flex items-center gap-2 rounded-lg bg-navy-950 px-3 py-1 text-white">
                  <QrCode size={16} className="text-gold-400" />
                  <span className="text-xs font-bold tracking-wider">QRIS RESMI SEKOLAH</span>
                </div>

                <p className="mt-2 font-display text-sm font-bold text-navy-950">{QRIS_CONFIG.merchant_name}</p>
                <p className="text-[11px] font-mono text-slate-500">NMID: {QRIS_CONFIG.nmid}</p>

                {/* QR Code Container */}
                <div className="relative my-4 rounded-2xl border-4 border-white bg-white p-4 shadow-md">
                  <div className="relative grid h-48 w-48 place-items-center rounded-xl bg-slate-900 p-2">
                    {/* SVG Realistic QRIS Representation */}
                    <svg viewBox="0 0 100 100" className="h-full w-full fill-white">
                      <rect x="0" y="0" width="30" height="30" fill="white" />
                      <rect x="5" y="5" width="20" height="20" fill="black" />
                      <rect x="10" y="10" width="10" height="10" fill="white" />
                      
                      <rect x="70" y="0" width="30" height="30" fill="white" />
                      <rect x="75" y="5" width="20" height="20" fill="black" />
                      <rect x="80" y="10" width="10" height="10" fill="white" />

                      <rect x="0" y="70" width="30" height="30" fill="white" />
                      <rect x="5" y="75" width="20" height="20" fill="black" />
                      <rect x="10" y="80" width="10" height="10" fill="white" />

                      {/* Noise patterns for realistic QR appearance */}
                      <rect x="35" y="5" width="10" height="10" fill="white" />
                      <rect x="50" y="10" width="15" height="10" fill="white" />
                      <rect x="35" y="35" width="30" height="30" fill="white" />
                      <rect x="42" y="42" width="16" height="16" fill="black" />
                      <rect x="47" y="47" width="6" height="6" fill="#f59e0b" />
                      <rect x="15" y="40" width="15" height="10" fill="white" />
                      <rect x="75" y="40" width="15" height="10" fill="white" />
                      <rect x="40" y="75" width="20" height="15" fill="white" />
                      <rect x="70" y="70" width="25" height="25" fill="white" />
                      <rect x="75" y="75" width="15" height="15" fill="black" />
                    </svg>
                  </div>
                  <div className="absolute inset-x-0 bottom-2 text-center">
                    <span className="rounded bg-navy-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      SPP {selectedInvoice?.period_month}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 max-w-md">
                  <p className="font-semibold">Nominal Pembayaran: {formatIDR(selectedInvoice?.amount)}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Buka aplikasi e-wallet / mobile banking Anda (BCA, Mandiri, GoPay, OVO, Dana) lalu scan kode di atas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: VIRTUAL ACCOUNT */}
          {method === 'va' && (
            <div className="mt-4 space-y-4 rounded-2xl border border-navy-200 bg-slate-50/80 p-5 animate-in fade-in">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Pilih Bank Virtual Account</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="input font-semibold"
                >
                  {SCHOOL_BANK_ACCOUNTS.map((b) => (
                    <option key={b.bank} value={b.bank}>
                      Virtual Account {b.bank}
                    </option>
                  ))}
                </select>
              </div>

              {/* VA Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">Nomor Virtual Account {selectedBank}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-mono text-xl font-bold tracking-wider text-navy-950">{vaNumber}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(vaNumber)}
                    className="focus-ring flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-100"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Atas Nama: <span className="font-semibold text-slate-800">SMKS JAKARTA PUSAT 1 — {currentStudent?.full_name}</span>
                </p>
              </div>
            </div>
          )}

          {/* METHOD 3: MANUAL BANK TRANSFER */}
          {method === 'transfer' && (
            <div className="mt-4 space-y-4 rounded-2xl border border-navy-200 bg-slate-50/80 p-5 animate-in fade-in">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Pilih Rekening Tujuan Sekolah</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="input font-semibold"
                >
                  {SCHOOL_BANK_ACCOUNTS.map((b) => (
                    <option key={b.bank} value={b.bank}>
                      {b.bank} — {b.account_number} (a.n {b.account_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank Account Info Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="text-[11px] font-medium text-slate-500">Nomor Rekening Resmi Sekolah ({activeBankAccount.bank})</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-mono text-xl font-bold tracking-wider text-navy-950">
                    {activeBankAccount.account_number}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeBankAccount.account_number)}
                    className="focus-ring flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-100"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Atas Nama: <span className="font-semibold text-slate-800">{activeBankAccount.account_name}</span>
                </p>
              </div>
            </div>
          )}

          {/* PROOF UPLOAD & SENDER FORM (FOR VA & TRANSFER) */}
          {method !== 'qris' && (
            <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                2. Unggah Bukti Pembayaran <span className="text-rose-500">*</span>
              </h4>
              <p className="text-xs text-slate-500">
                Wajib melampirkan screenshot / foto struk transfer sebelum konfirmasi dilakukan.
              </p>

              {/* Image Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  proofImage
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-300 bg-slate-50 hover:border-navy-500 hover:bg-navy-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {proofImage ? (
                  <div className="space-y-3">
                    <img
                      src={proofImage}
                      alt="Preview Bukti Transfer"
                      className="mx-auto max-h-48 rounded-xl object-contain shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                        <CheckCircle2 size={16} className="text-emerald-600" /> Bukti Berhasil Dipilih: {proofImageName}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        className="mt-2 text-xs font-semibold text-navy-700 underline hover:text-navy-900"
                      >
                        Ganti Gambar Bukti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid h-12 w-12 mx-auto place-items-center rounded-xl bg-navy-100 text-navy-700">
                      <Upload size={22} />
                    </div>
                    <p className="text-xs font-bold text-navy-950">Klik untuk unggah foto struk / screenshot transfer</p>
                    <p className="text-[11px] text-slate-400">Format JPG, PNG, atau WebP (Maks. 5MB)</p>
                  </div>
                )}
              </div>

              {/* Sample Proof Shortcuts for Quick Testing */}
              <div className="rounded-xl bg-slate-100/80 p-3">
                <p className="text-[11px] font-semibold text-slate-600 mb-2">
                  Atau pilih contoh bukti struk untuk pengujian cepat:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PROOFS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseSampleProof(s)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-navy-400 hover:bg-navy-50 transition"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Nama Pemilik Rekening Pengirim</span>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="input text-xs"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-700">Bank Asal Pengirim</span>
                  <input
                    type="text"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    placeholder="Contoh: Bank BCA / Mandiri"
                    className="input text-xs"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">Catatan Tambahan (Opsional)</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Pembayaran SPP September lunas"
                  className="input text-xs"
                />
              </label>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle size={16} /> {validationError}
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleProcessPayment}
            className="focus-ring mt-6 w-full rounded-xl bg-navy-700 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 shadow-sm"
          >
            {method === 'qris'
              ? `Konfirmasi Sudah Bayar QRIS — ${formatIDR(selectedInvoice?.amount)}`
              : `Kirim Bukti Pembayaran & Konfirmasi (${formatIDR(selectedInvoice?.amount)})`}
          </button>
        </div>
      </div>
    )
  }

  // STAGE 3: PROCESSING
  if (stage === 'processing') {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto animate-spin text-navy-700" size={44} />
          <p className="font-display text-lg font-bold text-navy-950">
            {method === 'qris' ? 'Memverifikasi pembayaran QRIS...' : 'Mengunggah bukti pembayaran...'}
          </p>
          <p className="text-xs text-slate-500">Mohon tunggu sebentar, data Anda sedang disimpan secara aman.</p>
        </div>
      </div>
    )
  }

  // STAGE 4: SUCCESS
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-navy-950/5">
        <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
          <CheckCircle2 size={36} />
        </div>

        <h3 className="font-display text-xl font-bold text-navy-950">
          {method === 'qris' ? 'Pembayaran Berhasil Dilakukan!' : 'Bukti Pembayaran Berhasil Dikirim!'}
        </h3>

        <p className="mt-1 text-xs text-slate-600">
          {method === 'qris'
            ? `SPP ${selectedInvoice?.period_month} ${selectedInvoice?.period_year} sebesar ${formatIDR(selectedInvoice?.amount)} telah dinyatakan LUNAS.`
            : `Bukti transfer SPP ${selectedInvoice?.period_month} ${selectedInvoice?.period_year} sebesar ${formatIDR(selectedInvoice?.amount)} telah masuk antrean verifikasi Tata Usaha.`}
        </p>

        {/* Ref Code */}
        {completedTrx && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs">
            <span className="text-slate-400">ID Referensi: </span>
            <span className="font-mono font-bold text-navy-950">{completedTrx.reference_code}</span>
          </div>
        )}

        {/* Real-time Simulated Notifications */}
        <div className="mt-5 space-y-2 text-left">
          <NotifyRow icon={MessageCircle} label="Notifikasi WhatsApp" sent={notified.wa} />
          <NotifyRow icon={Mail} label="Struk & Konfirmasi Email" sent={notified.email} />
        </div>

        <button
          onClick={finish}
          className="focus-ring mt-6 w-full rounded-xl bg-navy-700 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Kembali ke Portal SPP
        </button>
      </div>
    </div>
  )
}

function NotifyRow({ icon: Icon, label, sent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <div className={`grid h-8 w-8 place-items-center rounded-full ${sent ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
        {sent ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-navy-950">{label}</p>
        <p className="text-[11px] text-slate-500">{sent ? 'Terkirim ke nomor terdaftar' : 'Mengirim...'}</p>
      </div>
      <Icon size={16} className="text-slate-400" />
    </div>
  )
}
