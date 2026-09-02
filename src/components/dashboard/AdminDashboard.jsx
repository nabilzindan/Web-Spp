import React, { useState } from 'react'
import {
  Users,
  School,
  Wallet,
  TrendingUp,
  ChevronRight,
  Eye,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import StatCard from '../common/StatCard'
import MonthlyChart from './MonthlyChart'
import MethodSplitChart from './MethodSplitChart'
import ActivityFeed from './ActivityFeed'
import ClassStudentsModal from '../classes/ClassStudentsModal'
import {
  MOCK_MONTHLY_COLLECTION,
  MOCK_PAYMENT_METHOD_SPLIT,
  SCHOOL_INFO,
  formatIDR,
} from '../../lib/mockData'
import { useData } from '../../context/DataContext'

export default function AdminDashboard() {
  const { students, classes, activities, invoices, transactions } = useData()
  const [selectedClass, setSelectedClass] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const activeStudents = students.filter((s) => s.status === 'aktif')
  const totalCollected = MOCK_MONTHLY_COLLECTION.at(-1)?.terkumpul || 65000000

  // Calculate overall compliance
  const paidInvoices = invoices.filter((i) => i.status === 'paid').length
  const pendingInvoices = invoices.filter((i) => i.status === 'pending').length
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid' || i.status === 'overdue').length
  const compliancePct = invoices.length > 0 ? Math.round((paidInvoices / invoices.length) * 100) : 86

  const handleClassClick = (cls) => {
    setSelectedClass(cls)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* School Executive Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 p-6 text-white shadow-card border border-navy-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gold-500/20 px-2.5 py-0.5 text-xs font-bold text-gold-300">
                Administrator Utama
              </span>
              <span className="text-xs text-navy-300">• T.A. 2026/2027 Semester Ganjil</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold">{SCHOOL_INFO.name}</h2>
            <p className="mt-0.5 text-xs text-navy-200">
              {SCHOOL_INFO.alamat} • NPSN: <span className="font-mono text-gold-400">{SCHOOL_INFO.npsn}</span> • Akreditasi: {SCHOOL_INFO.akreditasi}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-center border border-white/10 backdrop-blur min-w-[120px]">
              <p className="text-[10px] text-navy-300">Kepatuhan SPP</p>
              <p className="font-display text-xl font-bold text-gold-400">{compliancePct}%</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center border border-white/10 backdrop-blur min-w-[120px]">
              <p className="text-[10px] text-navy-300">Total Rombel</p>
              <p className="font-display text-xl font-bold text-white">{classes.length} Kelas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Siswa Aktif"
          value={`${activeStudents.length} siswa`}
          delta="+3 pendaftar baru"
          accent="navy"
          subtitle="3 Jurusan (RPL, TKJ, AKL)"
        />
        <StatCard
          icon={School}
          label="Total Kelas / Rombel"
          value={`${classes.length} kelas`}
          accent="gold"
          subtitle="Tingkat X, XI, XII"
        />
        <StatCard
          icon={Wallet}
          label="Penerimaan Bulan Ini"
          value={formatIDR(totalCollected)}
          delta="+8.2% dari bulan lalu"
          accent="emerald"
          subtitle="Target: Rp 85.000.000"
        />
        <StatCard
          icon={TrendingUp}
          label="Tingkat Kepatuhan"
          value={`${compliancePct}%`}
          delta="Target 90%"
          deltaPositive={compliancePct >= 90}
          accent="rose"
          subtitle={`${unpaidInvoices} siswa belum bayar`}
        />
      </div>

      {/* Department Breakdown Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SCHOOL_INFO.majors.map((m) => (
          <div
            key={m.code}
            className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-card transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-navy-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-navy-800 dark:text-gold-400">
                Jurusan {m.code}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {m.compliance}% Kepatuhan
              </span>
            </div>
            <p className="font-display text-sm font-bold text-navy-950 dark:text-white mt-2">
              {m.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kepala Program: <span className="font-semibold text-slate-700 dark:text-slate-300">{m.head}</span>
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>{m.total_students} Siswa</span>
              <span className="font-mono text-[11px]">Tarif: Rp 350rb - 400rb</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MonthlyChart data={MOCK_MONTHLY_COLLECTION} />
        </div>
        <MethodSplitChart data={MOCK_PAYMENT_METHOD_SPLIT} />
      </div>

      {/* Class Summary and Activities */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-card ring-1 ring-navy-950/5 dark:ring-white/10 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-navy-950 dark:text-white">Ringkasan Kelas &amp; Kepatuhan SPP</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Klik pada baris kelas untuk membuka daftar murid, nomor kontak wali, dan status bayar
                </p>
              </div>
              <span className="rounded-lg bg-navy-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-navy-700 dark:text-gold-400">
                {classes.length} Rombel
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {classes.map((c) => {
                const classStudentList = students.filter((s) => s.class_id === c.id || s.class_name === c.name)
                const classInvoices = invoices.filter((i) => i.class_id === c.id || i.class_name === c.name)
                const paidCount = classInvoices.filter((i) => i.status === 'paid').length
                const totalInClass = classStudentList.length || c.student_count || 30

                return (
                  <div
                    key={c.id}
                    onClick={() => handleClassClick(c)}
                    className="group flex cursor-pointer items-center justify-between py-3.5 px-3 rounded-xl transition hover:bg-navy-50/60 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy-100 dark:bg-slate-800 text-xs font-bold text-navy-800 dark:text-gold-400 group-hover:bg-navy-700 group-hover:text-white transition">
                        {c.grade_level}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy-950 dark:text-white group-hover:text-navy-700 dark:group-hover:text-gold-400 transition flex items-center gap-1.5">
                          {c.name}
                          <span className="text-[11px] font-normal text-slate-400">({c.major || 'Umum'})</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Wali kelas: {c.homeroom_teacher}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {totalInClass} Siswa
                        </span>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {paidCount} Lunas
                        </p>
                      </div>
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-navy-700 group-hover:text-white transition">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <ActivityFeed items={activities} />
      </div>

      {/* Class Students Detail Modal */}
      <ClassStudentsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classData={selectedClass}
      />
    </div>
  )
}
