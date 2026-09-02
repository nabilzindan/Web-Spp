import React, { useState } from 'react'
import {
  Wallet,
  TrendingUp,
  Users,
  PieChart as PieIcon,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Building,
  Target,
  ArrowUpRight,
} from 'lucide-react'
import StatCard from '../common/StatCard'
import MonthlyChart from './MonthlyChart'
import MethodSplitChart from './MethodSplitChart'
import ClassStudentsModal from '../classes/ClassStudentsModal'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import {
  MOCK_MONTHLY_COLLECTION,
  MOCK_PAYMENT_METHOD_SPLIT,
  SCHOOL_INFO,
  formatIDR,
} from '../../lib/mockData'
import { useData } from '../../context/DataContext'

export default function PrincipalDashboard() {
  const { classes, students, invoices } = useData()
  const [selectedClass, setSelectedClass] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const classCompliance = classes.map((c, i) => {
    const classStudentList = students.filter((s) => s.class_id === c.id || s.class_name === c.name)
    const classInvoices = invoices.filter((inv) => inv.class_id === c.id || inv.class_name === c.name)
    const paidCount = classInvoices.filter((inv) => inv.status === 'paid').length
    const totalCount = classStudentList.length || 1
    const compliancePct = Math.round((paidCount / totalCount) * 100) || [92, 78, 88, 95, 70, 84][i] || 80
    return {
      ...c,
      name: c.name,
      compliance: compliancePct,
      paidCount,
      totalCount: classStudentList.length || c.student_count || 30,
    }
  })

  const ytd = MOCK_MONTHLY_COLLECTION.reduce((a, m) => a + m.terkumpul, 0)
  const avgCompliance = Math.round(
    classCompliance.reduce((a, c) => a + c.compliance, 0) / (classCompliance.length || 1)
  )

  const handleClassClick = (cls) => {
    setSelectedClass(cls)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Executive Principal Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-card border border-navy-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-gold-500/20 px-2.5 py-0.5 text-xs font-bold text-gold-300">
                Dashboard Eksekutif Kepala Sekolah
              </span>
              <span className="text-xs text-navy-300">• Laporan RAPBS &amp; Akuntabilitas Keuangan</span>
            </div>
            <h2 className="mt-1.5 font-display text-2xl font-bold">{SCHOOL_INFO.kepsek}</h2>
            <p className="text-xs text-navy-200">
              Kepala Sekolah • {SCHOOL_INFO.name} • NPSN: <span className="font-mono text-gold-400">{SCHOOL_INFO.npsn}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 border border-white/10 text-right backdrop-blur">
              <p className="text-[10px] text-navy-300">Target RAPBS 2026/2027</p>
              <p className="font-display text-lg font-bold text-gold-400">Rp 1.020.000.000</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10 text-right backdrop-blur">
              <p className="text-[10px] text-navy-300">Realisasi Penerimaan</p>
              <p className="font-display text-lg font-bold text-emerald-400">{formatIDR(ytd)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total Penerimaan (YTD)"
          value={formatIDR(ytd)}
          accent="navy"
          subtitle="Realisasi Semester Ganjil"
        />
        <StatCard
          icon={TrendingUp}
          label="Rata-rata Kepatuhan"
          value={`${avgCompliance}%`}
          delta="Target Sekolah 90%"
          deltaPositive={avgCompliance >= 90}
          accent="gold"
          subtitle={`${classCompliance.filter(c => c.compliance >= 90).length} kelas mencapai target`}
        />
        <StatCard
          icon={Users}
          label="Total Rombel Termonitor"
          value={`${classes.length} kelas`}
          accent="emerald"
          subtitle={`${students.length} siswa aktif`}
        />
        <StatCard
          icon={PieIcon}
          label="Kanal Bayar Dominan"
          value="Virtual Account"
          accent="rose"
          subtitle="48% transaksi via VA Bank"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MonthlyChart data={MOCK_MONTHLY_COLLECTION} />
        </div>
        <MethodSplitChart data={MOCK_PAYMENT_METHOD_SPLIT} />
      </div>

      {/* Class Compliance Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-card ring-1 ring-navy-950/5 dark:ring-white/10 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display text-base font-bold text-navy-950 dark:text-white">Kepatuhan Pembayaran per Rombongan Belajar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluasi persentase pelunasan SPP siswa per kelas. Klik pada kartu kelas untuk melihat rincian nama murid.
            </p>
          </div>
          <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Rata-rata Sekolah: {avgCompliance}%
          </span>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={classCompliance} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Kepatuhan SPP']}
              contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #cbd5e1' }}
            />
            <Bar dataKey="compliance" fill="#1f3a76" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>

        {/* Clickable Class Grid */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pilih Kelas untuk Audit Daftar Murid &amp; Status SPP
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classCompliance.map((c) => (
              <div
                key={c.id}
                onClick={() => handleClassClick(c)}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition hover:border-navy-500 hover:bg-navy-50/50 dark:hover:bg-slate-800/80 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm font-bold text-navy-950 dark:text-white group-hover:text-navy-700 dark:group-hover:text-gold-400">
                      {c.name}
                    </p>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        c.compliance >= 85
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-gold-100 dark:bg-gold-950/60 text-gold-800 dark:text-gold-300'
                      }`}
                    >
                      {c.compliance}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                    Wali: {c.homeroom_teacher}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-navy-700 dark:group-hover:text-gold-400">
                  <span className="text-xs font-bold">{c.totalCount} Siswa</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Students Modal */}
      <ClassStudentsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classData={selectedClass}
      />
    </div>
  )
}
