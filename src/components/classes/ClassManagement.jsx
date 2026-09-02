import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Users, Eye } from 'lucide-react'
import DataTable from '../common/DataTable'
import Modal from '../common/Modal'
import ClassStudentsModal from './ClassStudentsModal'
import { useData } from '../../context/DataContext'

const emptyForm = { name: '', grade_level: 'X', major: 'Rekayasa Perangkat Lunak', homeroom_teacher: '', student_count: 0 }

export default function ClassManagement() {
  const { classes, setClasses } = useData()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [selectedClassForStudents, setSelectedClassForStudents] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.homeroom_teacher.toLowerCase().includes(search.toLowerCase()) ||
    (c.major && c.major.toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm(row)
    setModalOpen(true)
  }

  const viewClassStudents = (row) => {
    setSelectedClassForStudents(row)
    setStudentsModalOpen(true)
  }

  const save = () => {
    if (editing) {
      setClasses((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...form } : c)))
    } else {
      const newClass = {
        ...form,
        id: `c-${Date.now()}`,
        academic_year: '2026/2027',
      }
      setClasses((prev) => [...prev, newClass])
    }
    setModalOpen(false)
  }

  const remove = (id) => {
    if (window.confirm('Yakin ingin menghapus kelas ini?')) {
      setClasses((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const columns = [
    { key: 'name', header: 'Nama Kelas', render: (r) => <span className="font-semibold text-navy-950">{r.name}</span> },
    { key: 'grade_level', header: 'Tingkat' },
    { key: 'major', header: 'Jurusan', render: (r) => r.major || '—' },
    { key: 'homeroom_teacher', header: 'Wali Kelas' },
    { key: 'student_count', header: 'Kapasitas Siswa', render: (r) => `${r.student_count || 32} siswa` },
    {
      key: 'actions',
      header: 'Aksi',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => viewClassStudents(r)}
            className="focus-ring flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-100"
            title="Lihat Daftar Siswa"
          >
            <Users size={14} /> Lihat Siswa
          </button>
          <button
            onClick={() => openEdit(r)}
            className="focus-ring rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            title="Edit Kelas"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => remove(r.id)}
            className="focus-ring rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
            title="Hapus Kelas"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-navy-950">Daftar Kelas &amp; Rombel</h3>
          <p className="text-xs text-slate-500">Kelola master rombongan belajar dan wali kelas</p>
        </div>
        <button
          onClick={openAdd}
          className="focus-ring flex items-center gap-1.5 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Plus size={16} /> Tambah Kelas
        </button>
      </div>

      <DataTable columns={columns} rows={filtered} search={search} onSearch={setSearch} />

      {/* Edit / Add Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="focus-ring rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              onClick={save}
              className="focus-ring rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
            >
              Simpan
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Kelas</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Contoh: X RPL 1"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Tingkat</span>
            <select
              value={form.grade_level}
              onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
              className="input"
            >
              <option value="X">X (Sepuluh)</option>
              <option value="XI">XI (Sebelas)</option>
              <option value="XII">XII (Dua Belas)</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Jurusan</span>
            <input
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              className="input"
              placeholder="Contoh: Rekayasa Perangkat Lunak"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Wali Kelas</span>
            <input
              value={form.homeroom_teacher}
              onChange={(e) => setForm({ ...form, homeroom_teacher: e.target.value })}
              className="input"
              placeholder="Nama Guru & Gelar"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Jumlah Siswa</span>
            <input
              type="number"
              value={form.student_count}
              onChange={(e) => setForm({ ...form, student_count: Number(e.target.value) })}
              className="input"
            />
          </label>
        </div>
      </Modal>

      {/* Class Students Modal */}
      <ClassStudentsModal
        open={studentsModalOpen}
        onClose={() => setStudentsModalOpen(false)}
        classData={selectedClassForStudents}
      />
    </div>
  )
}
