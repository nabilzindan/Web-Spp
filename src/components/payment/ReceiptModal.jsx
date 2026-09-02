import React, { useRef } from 'react'
import { Printer, Download, CheckCircle2, ShieldCheck, X, School, QrCode } from 'lucide-react'
import Modal from '../common/Modal'
import { formatIDR } from '../../lib/mockData'

export default function ReceiptModal({ open, onClose, payment, invoice, student }) {
  const receiptRef = useRef(null)

  if (!payment && !invoice) return null

  const studentName = student?.full_name || payment?.student_name || invoice?.student_name || 'Siswa'
  const className = student?.class_name || payment?.class_name || invoice?.class_name || 'Kelas'
  const nis = student?.nis || '23101001'
  const nisn = student?.nisn || '0061234561'
  const amount = payment?.amount || invoice?.amount || 375000
  const period = invoice ? `SPP ${invoice.period_month} ${invoice.period_year}` : 'SPP Periode Berjalan'
  const receiptNo = payment?.reference_code ? `KW-${payment.reference_code.replace(/[^a-zA-Z0-9]/g, '')}` : `KW-202609-${Math.floor(1000 + Math.random() * 9000)}`
  const datePaid = payment?.paid_at || new Date().toISOString().split('T')[0]
  const method = payment?.method || 'Transfer Bank / QRIS'

  // Fee item breakdown
  const baseTuition = Math.round(amount * 0.75)
  const labFee = Math.round(amount * 0.15)
  const osisFee = amount - baseTuition - labFee

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kwitansi Resmi Pembayaran SPP"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Printable Area */}
        <div ref={receiptRef} className="printable-receipt rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-navy-950 dark:text-slate-100">
          {/* School Letterhead (Kop Surat) */}
          <div className="border-b-2 border-navy-950 dark:border-slate-300 pb-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-gold-400">
                <School size={26} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-wide uppercase">
                  SMKS JAKARTA PUSAT 1
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  NPSN: 20100123 • Akreditasi: A (Amat Baik) • SK Pendirian: 421.5/120/SMK
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Jl. Kramat Raya No. 24, Senen, Jakarta Pusat 10420 • Telp: (021) 3908871 • Web: smksjp1.sch.id
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="my-4 text-center">
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-navy-700 dark:text-gold-400">
              BUKTI PEMBAYARAN SPP RESMI (TANDA TERIMA)
            </h4>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">No. Kwitansi: {receiptNo}</p>
          </div>

          {/* Metadata Table */}
          <div className="grid grid-cols-2 gap-y-2 text-xs border-y border-slate-200 dark:border-slate-800 py-3 mb-4">
            <div>
              <span className="text-slate-400">Nama Siswa:</span>
              <p className="font-bold text-navy-950 dark:text-white">{studentName}</p>
            </div>
            <div>
              <span className="text-slate-400">Kelas / Jurusan:</span>
              <p className="font-bold text-navy-950 dark:text-white">{className}</p>
            </div>
            <div>
              <span className="text-slate-400">Nomor Induk Siswa (NIS / NISN):</span>
              <p className="font-mono font-semibold">{nis} / {nisn}</p>
            </div>
            <div>
              <span className="text-slate-400">Metode &amp; Waktu Bayar:</span>
              <p className="font-semibold">{method} • {datePaid}</p>
            </div>
          </div>

          {/* Items Breakdown */}
          <table className="w-full text-left text-xs mb-4">
            <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase">
              <tr>
                <th className="p-2">No</th>
                <th className="p-2">Komponen Pembayaran</th>
                <th className="p-2 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-2 text-slate-400 font-mono">1</td>
                <td className="p-2">
                  <p className="font-semibold">{period}</p>
                  <p className="text-[10px] text-slate-400">Biaya pendidikan pokok bulanan</p>
                </td>
                <td className="p-2 text-right font-mono font-semibold">{formatIDR(baseTuition)}</td>
              </tr>
              <tr>
                <td className="p-2 text-slate-400 font-mono">2</td>
                <td className="p-2">
                  <p className="font-semibold">Iuran Praktikum &amp; Laboratorium Komputer</p>
                  <p className="text-[10px] text-slate-400">Pemeliharaan perangkat &amp; internet berkecepatan tinggi</p>
                </td>
                <td className="p-2 text-right font-mono font-semibold">{formatIDR(labFee)}</td>
              </tr>
              <tr>
                <td className="p-2 text-slate-400 font-mono">3</td>
                <td className="p-2">
                  <p className="font-semibold">Kas Ekstrakurikuler &amp; OSIS</p>
                  <p className="text-[10px] text-slate-400">Kegiatan pembinaan kesiswaan</p>
                </td>
                <td className="p-2 text-right font-mono font-semibold">{formatIDR(osisFee)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy-950 dark:border-slate-300 font-bold bg-slate-50 dark:bg-slate-800/60">
                <td colSpan={2} className="p-2.5 text-right font-display text-xs">TOTAL DIBAYAR:</td>
                <td className="p-2.5 text-right font-display text-sm text-navy-700 dark:text-gold-400 font-bold">
                  {formatIDR(amount)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Stamp & Verification */}
          <div className="flex items-end justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="grid h-16 w-16 place-items-center rounded-lg border border-slate-300 p-1">
                <QrCode size={52} className="text-slate-800 dark:text-slate-200" />
              </div>
              <div className="text-[10px] text-slate-400 max-w-[150px]">
                <p className="font-semibold text-slate-600 dark:text-slate-300">VALIDASI ELEKTRONIK</p>
                <p>Dokumen ini sah dan dikeluarkan secara otomatis oleh Sistem SPP SMKS Jakarta Pusat 1.</p>
              </div>
            </div>

            {/* Official Stamp Box */}
            <div className="text-center">
              <p className="text-[11px] text-slate-500">Jakarta, {datePaid}</p>
              <div className="relative my-1 inline-block">
                <div className="rounded-xl border-2 border-emerald-600 bg-emerald-50/50 px-3 py-1 font-bold text-emerald-700 text-xs tracking-wider rotate-[-6deg]">
                  ✓ LUNAS DIVERIFIKASI
                </div>
              </div>
              <p className="font-bold text-xs underline">Siti Nurjanah, S.E.</p>
              <p className="text-[10px] text-slate-400">Bendahara Sekolah</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="focus-ring rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="focus-ring flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-800 shadow-sm"
          >
            <Printer size={15} /> Cetak Kwitansi / Simpan PDF
          </button>
        </div>
      </div>
    </Modal>
  )
}
