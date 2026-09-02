import React, { useState } from 'react'
import { CheckCircle2, XCircle, FileText, Download, ExternalLink, ShieldCheck, User, Calendar, CreditCard } from 'lucide-react'
import Modal from '../common/Modal'
import Badge, { statusToBadge } from '../common/Badge'
import { formatIDR } from '../../lib/mockData'

export default function PaymentProofModal({ open, onClose, payment, onApprove, onReject, canVerify = false }) {
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  if (!payment) return null

  const badge = statusToBadge(payment.status)

  const handleApprove = () => {
    if (onApprove) onApprove(payment.id)
    onClose()
  }

  const handleReject = () => {
    if (onReject) onReject(payment.id, rejectReason)
    setIsRejecting(false)
    setRejectReason('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bukti & Detail Pembayaran SPP"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
          <div>
            <p className="text-xs text-slate-500">ID Transaksi / Kode Ref</p>
            <p className="font-mono text-sm font-bold text-navy-950">{payment.reference_code || payment.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Nominal Transfer</p>
            <p className="font-display text-lg font-bold text-navy-950">{formatIDR(payment.amount)}</p>
          </div>
        </div>

        {/* Transaction Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 p-3 bg-white">
            <p className="text-slate-400">Nama Siswa</p>
            <p className="font-semibold text-navy-950 mt-0.5">{payment.student_name}</p>
            <p className="text-[11px] text-slate-500">{payment.class_name}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3 bg-white">
            <p className="text-slate-400">Metode & Bank</p>
            <p className="font-semibold text-navy-950 mt-0.5">{payment.method}</p>
            <p className="text-[11px] text-slate-500">{payment.bank_name || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3 bg-white">
            <p className="text-slate-400">Pengirim</p>
            <p className="font-semibold text-navy-950 mt-0.5">{payment.sender_name || '—'}</p>
            <p className="text-[11px] text-slate-500">{payment.sender_bank || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3 bg-white">
            <p className="text-slate-400">Waktu Pembayaran</p>
            <p className="font-semibold text-navy-950 mt-0.5">{payment.paid_at || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3 bg-white">
            <p className="text-slate-400">Status Saat Ini</p>
            <div className="mt-1">
              <Badge color={badge.color}>{badge.label}</Badge>
            </div>
          </div>
          {payment.verification_notes && (
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-rose-100 p-3 bg-rose-50 text-rose-800">
              <p className="text-slate-400">Catatan Verifikasi</p>
              <p className="font-medium text-xs mt-0.5">{payment.verification_notes}</p>
            </div>
          )}
        </div>

        {/* Payment Proof Image Preview */}
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Gambar Bukti Struk / Transfer
          </h4>
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-900/5 p-2 text-center">
            {payment.proof_image_url ? (
              <div className="group relative">
                <img
                  src={payment.proof_image_url}
                  alt="Bukti Transfer SPP"
                  className="mx-auto max-h-80 w-auto rounded-xl object-contain shadow-sm"
                />
                <a
                  href={payment.proof_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-navy-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-navy-950"
                >
                  <ExternalLink size={14} /> Buka Ukuran Penuh
                </a>
              </div>
            ) : (
              <div className="py-12 text-slate-400">
                <FileText className="mx-auto mb-2 opacity-50" size={36} />
                <p className="text-sm font-medium">Bukti transfer tidak dilampirkan atau QRIS otomatis.</p>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Input (if toggled) */}
        {isRejecting && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 space-y-2 animate-in fade-in">
            <label className="block text-xs font-bold text-rose-900">Alasan Penolakan Bukti Transfer:</label>
            <input
              type="text"
              placeholder="Contoh: Nominal transfer kurang, foto buram / tidak terbaca..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="focus-ring w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs text-rose-950"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsRejecting(false)}
                className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        )}

        {/* Verification Action Buttons (Only for Staff TU/Admin on pending items) */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            onClick={onClose}
            className="focus-ring rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Tutup
          </button>

          {canVerify && payment.status === 'pending' && !isRejecting && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRejecting(true)}
                className="focus-ring flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                <XCircle size={15} /> Tolak Pembayaran
              </button>
              <button
                onClick={handleApprove}
                className="focus-ring flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
              >
                <CheckCircle2 size={15} /> Setujui &amp; Nyatakan Lunas
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
