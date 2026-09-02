import React, { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../common/DataTable'
import Modal from '../common/Modal'
import { formatIDR } from '../../lib/mockData'
import { useData } from '../../context/DataContext'

export default function SppManagement() {
  const { sppRates, setSppRates, classes } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ class_id: classes[0]?.id || '', nominal: 350000 })

  const openAdd = () => {
    setEditing(null)
    setForm({ class_id: classes[0]?.id || '', nominal: 350000 })
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
      setSppRates((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...payload } : r)))
    } else {
      const newRate = {
        ...payload,
        id: `r-${Date.now()}`,
        academic_year: '2026/2027',
      }
      setSppRates((prev) => [...prev, newRate])
    }
    setModalOpen(false)
  }

  const remove = (id) => {
    if (window.confirm('Yakin ingin menghapus tarif SPP ini?')) {
      setSppRates((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const columns = [
    { key: 'class_name', header: 'Kelas / Rombel', render: (r) => <span className="font-semibold text-navy-950">{r.class_name}</span> },
    {
      key: 'nominal',
      header: 'Nominal SPP / Bulan',
      render: (r) => <span className="font-display font-bold text-navy-950">{formatIDR(r.nominal)}</span>,
    },
    {
      key: 'academic_year',
      header: 'Tahun Ajaran',
      render: (r) => r.academic_year || '2026/2027',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (r) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => openEdit(r)}
            className="focus-ring rounded-lg p-1.5 text-navy-700 hover:bg-navy-50"
            title="Edit Nominal"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => remove(r.id)}
            className="focus-ring rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
            title="Hapus"
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
          <h3 className="font-display text-base font-bold text-navy-950">Master Tarif SPP Bulanan</h3>
          <p className="text-xs text-slate-500">Atur nominal tagihan SPP per rombongan belajar / tingkat kelas</p>
        </div>
        <button
          onClick={openAdd}
          className="focus-ring flex items-center gap-1.5 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 shadow-sm"
        >
          <Plus size={16} /> Tambah Nominal SPP
        </button>
      </div>

      <DataTable columns={columns} rows={sppRates} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Nominal SPP' : 'Tambah Nominal SPP'}
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
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Kelas / Rombel</span>
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
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Nominal SPP (Rp)</span>
            <input
              type="number"
              step={10000}
              value={form.nominal}
              onChange={(e) => setForm({ ...form, nominal: Number(e.target.value) })}
              className="input text-xs font-bold"
            />
          </label>
        </div>
      </Modal>
    </div>
  )
}
