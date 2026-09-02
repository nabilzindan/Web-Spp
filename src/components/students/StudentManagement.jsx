import React, { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import DataTable from '../common/DataTable'
import Modal from '../common/Modal'
import Badge, { statusToBadge } from '../common/Badge'
import { useData } from '../../context/DataContext'

export default function StudentManagement() {
  const { students, setStudents, classes } = useData()
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    nis: '',
    nisn: '',
    full_name: '',
    class_id: classes[0]?.id || '',
    parent_name: '',
    parent_phone: '',
    status: 'aktif',
  })

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.nis.includes(search) ||
        (s.parent_name && s.parent_name.toLowerCase().includes(search.toLowerCase()))
      const matchesClass = classFilter === 'all' || s.class_id === classFilter || s.class_name === classFilter
      return matchesSearch && matchesClass
    })
  }, [students, search, classFilter])

  const openAdd = () => {
    setEditing(null)
    setForm({
      nis: '',
      nisn: '',
      full_name: '',
      class_id: classes[0]?.id || '',
      parent_name: '',
      parent_phone: '',
      status: 'aktif',
    })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm(row)
    setModalOpen(true)
  }

  const save = () => {
    const targetClass = classes.find((c) => c.id === form.class_id)
    const className = targetClass ? targetClass.name : form.class_name || ''
    const payload = { ...form, class_name: className }

    if (editing) {
      setStudents((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...payload } : s)))
    } else {
      const newStudent = {
        ...payload,
        id: `s-${Date.now()}`,
      }
      setStudents((prev) => [...prev, newStudent])
    }
    setModalOpen(false)
  }

  const remove = (id) => {
    if (window.confirm('Yakin ingin menghapus data siswa ini?')) {
      setStudents((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const columns = [
    { key: 'nis', header: 'NIS', render: (r) => <span className="font-mono font-semibold">{r.nis}</span> },
    { key: 'full_name', header: 'Nama Siswa', render: (r) => <span className="font-semibold text-navy-950">{r.full_name}</span> },
    { key: 'class_name', header: 'Kelas' },
    {
      key: 'parent_name',
      header: 'Orang Tua / Kontak',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-800">{r.parent_name}</p>
          <p className="text-[11px] text-slate-400">{r.parent_phone || '—'}</p>
        </div>
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
      key: 'actions',
      header: 'Aksi',
      render: (r) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => openEdit(r)}
            className="focus-ring rounded-lg p-1.5 text-navy-700 hover:bg-navy-50"
            title="Edit Siswa"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => remove(r.id)}
            className="focus-ring rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
            title="Hapus Siswa"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-navy-950">Data Siswa Terdaftar</h3>
          <p className="text-xs text-slate-500">Kelola master data siswa dan relasi orang tua/wali</p>
        </div>
        <button
          onClick={openAdd}
          className="focus-ring flex items-center gap-1.5 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 shadow-sm"
        >
          <Plus size={16} /> Tambah Siswa Baru
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        search={search}
        onSearch={setSearch}
        filters={
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="focus-ring rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
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
            <span className="mb-1 block text-xs font-semibold text-slate-600">Nomor Induk Siswa (NIS)</span>
            <input
              value={form.nis}
              onChange={(e) => setForm({ ...form, nis: e.target.value })}
              className="input text-xs font-mono"
              placeholder="Contoh: 23101001"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Nama Lengkap Siswa</span>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input text-xs"
              placeholder="Nama lengkap sesuai akta"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Kelas / Rombel</span>
            <select
              value={form.class_id}
              onChange={(e) => setForm({ ...form, class_id: e.target.value })}
              className="input text-xs"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.homeroom_teacher})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Nama Orang Tua/Wali</span>
              <input
                value={form.parent_name}
                onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                className="input text-xs"
                placeholder="Nama ayah / ibu / wali"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">No. WhatsApp / HP Ortu</span>
              <input
                value={form.parent_phone}
                onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
                className="input text-xs"
                placeholder="0812-xxxx-xxxx"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Status Siswa</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input text-xs"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-aktif</option>
              <option value="lulus">Lulus</option>
              <option value="pindah">Pindah</option>
            </select>
          </label>
        </div>
      </Modal>
    </div>
  )
}
