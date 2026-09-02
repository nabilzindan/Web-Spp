import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  MOCK_STUDENTS,
  MOCK_CLASSES,
  MOCK_SPP_RATES,
  MOCK_INVOICES,
  MOCK_TRANSACTIONS,
  MOCK_NOTIFICATIONS,
  MOCK_RECENT_ACTIVITY,
  formatIDR,
} from '../lib/mockData'

const DataContext = createContext(null)

const STORAGE_KEYS = {
  students: 'spp_data_students_v2',
  classes: 'spp_data_classes_v2',
  sppRates: 'spp_data_spp_rates_v2',
  invoices: 'spp_data_invoices_v2',
  transactions: 'spp_data_transactions_v2',
  notifications: 'spp_data_notifications_v2',
  activities: 'spp_data_activities_v2',
}

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read from localStorage', e)
  }
  return fallback
}

export function DataProvider({ children }) {
  const [students, setStudents] = useState(() => loadStorage(STORAGE_KEYS.students, MOCK_STUDENTS))
  const [classes, setClasses] = useState(() => loadStorage(STORAGE_KEYS.classes, MOCK_CLASSES))
  const [sppRates, setSppRates] = useState(() => loadStorage(STORAGE_KEYS.sppRates, MOCK_SPP_RATES))
  const [invoices, setInvoices] = useState(() => loadStorage(STORAGE_KEYS.invoices, MOCK_INVOICES))
  const [transactions, setTransactions] = useState(() => loadStorage(STORAGE_KEYS.transactions, MOCK_TRANSACTIONS))
  const [notifications, setNotifications] = useState(() => loadStorage(STORAGE_KEYS.notifications, MOCK_NOTIFICATIONS))
  const [activities, setActivities] = useState(() => loadStorage(STORAGE_KEYS.activities, MOCK_RECENT_ACTIVITY))
  const [toast, setToast] = useState(null)

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students))
  }, [students])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes))
  }, [classes])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sppRates, JSON.stringify(sppRates))
  }, [sppRates])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices))
  }, [invoices])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions))
  }, [transactions])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications))
  }, [notifications])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities))
  }, [activities])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3900 ? null : curr))
    }, 4000)
  }, [])

  const addNotification = useCallback(({ title, message, type = 'info', recipient_role = 'all', recipient_id = null, link = 'dashboard' }) => {
    const newNotif = {
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipient_role,
      recipient_id,
      title,
      message,
      type,
      time: 'Baru saja',
      is_read: false,
      link,
      created_at: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotif, ...prev])
    return newNotif
  }, [])

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    )
  }, [])

  const markAllNotificationsRead = useCallback((role, userId) => {
    setNotifications((prev) =>
      prev.map((n) => {
        const matchRole = n.recipient_role === 'all' || n.recipient_role === role || n.recipient_id === userId
        return matchRole ? { ...n, is_read: true } : n
      })
    )
    showToast('Semua notifikasi ditandai telah dibaca', 'info')
  }, [showToast])

  const deleteNotification = useCallback((notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    showToast('Notifikasi dibersihkan', 'info')
  }, [showToast])

  // Process payment submission
  const submitPayment = useCallback(({ invoice, method, bankName, senderName, senderBank, proofImageUrl, notes }) => {
    const isQris = method === 'qris'
    const status = isQris ? 'success' : 'pending'
    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const refCode = isQris
      ? `QR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
      : method === 'va'
      ? `VA-88081-${Math.floor(1000 + Math.random() * 9000)}`
      : `TF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`

    const newPayment = {
      id: `trx${Date.now().toString().slice(-4)}`,
      invoice_id: invoice.id,
      student_id: invoice.student_id,
      student_name: invoice.student_name,
      class_name: invoice.class_name,
      method: isQris ? 'QRIS' : method === 'va' ? `Virtual Account ${bankName || 'BCA'}` : 'Transfer Bank',
      bank_name: bankName || (isQris ? 'QRIS SMKS JP 1' : 'Bank BCA'),
      sender_name: senderName || 'Orang Tua Siswa',
      sender_bank: senderBank || bankName || 'Bank',
      proof_image_url: proofImageUrl || null,
      amount: invoice.amount,
      status,
      paid_at: formattedDate,
      reference_code: refCode,
      notes: notes || '',
    }

    // Update transactions
    setTransactions((prev) => [newPayment, ...prev])

    // Update invoice status
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoice.id ? { ...inv, status: isQris ? 'paid' : 'pending' } : inv))
    )

    // Log recent activity
    const actText = isQris
      ? `Pembayaran SPP ${invoice.student_name} (${invoice.class_name}) berhasil via QRIS (${formatIDR(invoice.amount)})`
      : `Bukti transfer SPP ${invoice.student_name} (${invoice.class_name}) diunggah dan menunggu verifikasi`
    
    setActivities((prev) => [{ id: `a-${Date.now()}`, text: actText, time: 'Baru saja', type: isQris ? 'success' : 'info' }, ...prev])

    // Send notifications
    if (isQris) {
      addNotification({
        recipient_role: 'ortu',
        title: 'Pembayaran SPP Berhasil',
        message: `Pembayaran SPP ${invoice.period_month} ${invoice.period_year} untuk ${invoice.student_name} sebesar ${formatIDR(invoice.amount)} berhasil via QRIS.`,
        type: 'success',
      })
      addNotification({
        recipient_role: 'tu',
        title: 'Penerimaan SPP Masuk (QRIS)',
        message: `Penerimaan SPP ${invoice.student_name} (${invoice.class_name}) sebesar ${formatIDR(invoice.amount)} lunas via QRIS.`,
        type: 'info',
      })
      showToast(`Pembayaran SPP ${formatIDR(invoice.amount)} Berhasil!`, 'success')
    } else {
      addNotification({
        recipient_role: 'tu',
        title: 'Verifikasi Pembayaran Baru',
        message: `${invoice.student_name} (${invoice.class_name}) mengunggah bukti transfer ${bankName || 'Bank'} sebesar ${formatIDR(invoice.amount)}. Mohon diperiksa.`,
        type: 'warning',
      })
      addNotification({
        recipient_role: 'ortu',
        title: 'Bukti Pembayaran Terkirim',
        message: `Bukti transfer SPP ${invoice.period_month} ${invoice.period_year} sebesar ${formatIDR(invoice.amount)} telah diterima dan sedang diverifikasi oleh Tata Usaha.`,
        type: 'info',
      })
      showToast('Bukti pembayaran berhasil dikirim! Menunggu verifikasi TU.', 'success')
    }

    return newPayment
  }, [addNotification, showToast])

  // Verify payment (TU / Admin action)
  const verifyPayment = useCallback((paymentId, newStatus, notes = '') => {
    let targetPayment = null

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === paymentId) {
          targetPayment = { ...t, status: newStatus, verification_notes: notes }
          return targetPayment
        }
        return t
      })
    )

    if (targetPayment) {
      // Sync invoice status
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === targetPayment.invoice_id) {
            return { ...inv, status: newStatus === 'success' ? 'paid' : 'unpaid' }
          }
          return inv
        })
      )

      // Notify
      if (newStatus === 'success') {
        addNotification({
          recipient_role: 'ortu',
          title: 'Pembayaran Dikonfirmasi Lunas',
          message: `Bukti pembayaran SPP ananda ${targetPayment.student_name} sebesar ${formatIDR(targetPayment.amount)} telah diverifikasi dan dinyatakan LUNAS.`,
          type: 'success',
        })
        setActivities((prev) => [
          {
            id: `a-${Date.now()}`,
            text: `Pembayaran ${targetPayment.student_name} (${targetPayment.class_name}) sebesar ${formatIDR(targetPayment.amount)} diverifikasi Lunas oleh TU`,
            time: 'Baru saja',
            type: 'success',
          },
          ...prev,
        ])
        showToast(`Transaksi ${targetPayment.reference_code} berhasil disetujui & lunas!`, 'success')
      } else if (newStatus === 'failed') {
        addNotification({
          recipient_role: 'ortu',
          title: 'Pembayaran Ditolak',
          message: `Bukti transfer SPP untuk ananda ${targetPayment.student_name} tidak valid atau belum masuk ke rekening sekolah. ${notes ? `Catatan: ${notes}` : 'Silakan hubungi TU atau upload ulang bukti transfer.'}`,
          type: 'error',
        })
        setActivities((prev) => [
          {
            id: `a-${Date.now()}`,
            text: `Pembayaran ${targetPayment.student_name} ditolak oleh TU: ${notes || 'Bukti transfer tidak valid'}`,
            time: 'Baru saja',
            type: 'error',
          },
          ...prev,
        ])
        showToast(`Transaksi ${targetPayment.reference_code} telah ditolak.`, 'error')
      }
    }
  }, [addNotification, showToast])

  const value = useMemo(
    () => ({
      students,
      setStudents,
      classes,
      setClasses,
      sppRates,
      setSppRates,
      invoices,
      setInvoices,
      transactions,
      setTransactions,
      notifications,
      activities,
      toast,
      showToast,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearAllNotifications,
      submitPayment,
      verifyPayment,
    }),
    [
      students,
      classes,
      sppRates,
      invoices,
      transactions,
      notifications,
      activities,
      toast,
      showToast,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearAllNotifications,
      submitPayment,
      verifyPayment,
    ]
  )

  return (
    <DataContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-2xl bg-navy-950 px-4 py-3.5 text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-gold-400'
            }`}
          />
          <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
