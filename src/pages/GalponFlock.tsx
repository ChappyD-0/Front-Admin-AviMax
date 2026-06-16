import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bird, PlusCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import { getFlocks, createFlock, closeFlock } from '../api/flocks'
import {
  getMortality, createMortality,
  getWeightByFlock, getWeightByFlockGender, getWeightByFlockRange,
  getLatestWeightByFlockGender,
  createWeight,
  getConsumption, createConsumption,
} from '../api/records'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import type { Flock, Gender } from '../types'

const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  )
}

// ── Nueva parvada ─────────────────────────────────────────────────────────────

function CreateFlockForm({ galponId, onDone, onCancel }: {
  galponId: number; onDone: () => void; onCancel: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    name: '', totalBirds: '', maleCount: '', femaleCount: '',
    birdLot: '', flockDate: today, notes: '',
  })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const mut = useMutation({
    mutationFn: () => createFlock(galponId, {
      name: form.name,
      totalBirds: Number(form.totalBirds),
      maleCount:  form.maleCount   ? Number(form.maleCount)   : undefined,
      femaleCount: form.femaleCount ? Number(form.femaleCount) : undefined,
      birdLot:    form.birdLot    || undefined,
      flockDate:  form.flockDate,
      notes:      form.notes      || undefined,
    }),
    onSuccess: onDone,
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }}
      className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">Nueva parvada</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Lote Junio" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Total de aves *</label>
          <input type="number" min="1" className={inputClass} value={form.totalBirds} onChange={(e) => set('totalBirds', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Lote</label>
          <input className={inputClass} value={form.birdLot} onChange={(e) => set('birdLot', e.target.value)} placeholder="LOT-2026-06" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Machos</label>
          <input type="number" min="0" className={inputClass} value={form.maleCount} onChange={(e) => set('maleCount', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hembras</label>
          <input type="number" min="0" className={inputClass} value={form.femaleCount} onChange={(e) => set('femaleCount', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de inicio *</label>
          <input type="date" className={inputClass} value={form.flockDate} onChange={(e) => set('flockDate', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
          <input className={inputClass} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>
      {mut.isError && <p className="text-xs text-red-600">{(mut.error as Error).message}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm">Cancelar</button>
        <button type="submit" disabled={mut.isPending} className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60">
          {mut.isPending ? 'Creando...' : 'Crear parvada'}
        </button>
      </div>
    </form>
  )
}

// ── Mortalidad ────────────────────────────────────────────────────────────────

function MortalidadSection({ galponId }: { galponId: number }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ maleCount: '', femaleCount: '', observations: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const { data = [], isLoading } = useQuery({
    queryKey: ['mortality', String(galponId)],
    queryFn: () => getMortality(galponId),
  })

  const mut = useMutation({
    mutationFn: () => createMortality(galponId, {
      maleCount:   Number(form.maleCount) || 0,
      femaleCount: Number(form.femaleCount) || 0,
      observations: form.observations || undefined,
    }),
    onSuccess: () => {
      setForm({ maleCount: '', femaleCount: '', observations: '' })
      setShowForm(false)
      qc.invalidateQueries({ queryKey: ['mortality', String(galponId)] })
    },
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Registros de mortalidad</span>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium">
            <PlusCircle size={13} /> Registrar
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }}
          className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Machos muertos</label>
              <input type="number" min="0" className={inputClass} value={form.maleCount} onChange={(e) => set('maleCount', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hembras muertas</label>
              <input type="number" min="0" className={inputClass} value={form.femaleCount} onChange={(e) => set('femaleCount', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
              <input className={inputClass} value={form.observations} onChange={(e) => set('observations', e.target.value)} />
            </div>
          </div>
          {mut.isError && <p className="text-xs text-red-600">{(mut.error as Error).message}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={mut.isPending} className="px-3 py-1 text-xs rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-60">
              {mut.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
      {isLoading ? <LoadingState /> : data.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Sin registros de mortalidad.</p>
      ) : (
        <table className="w-full text-xs">
          <thead><tr className="text-left text-slate-400 border-b border-slate-100">
            <th className="py-1.5 pr-3">Fecha</th><th className="py-1.5 pr-3">Día</th>
            <th className="py-1.5 pr-3">Machos</th><th className="py-1.5 pr-3">Hembras</th>
            <th className="py-1.5 pr-3">Total</th><th className="py-1.5">Observaciones</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((r) => (
              <tr key={r.id}>
                <td className="py-1.5 pr-3 text-slate-500">{r.recordDate}</td>
                <td className="py-1.5 pr-3 text-slate-500">{r.ageDays}</td>
                <td className="py-1.5 pr-3">{r.maleCount}</td>
                <td className="py-1.5 pr-3">{r.femaleCount}</td>
                <td className="py-1.5 pr-3 font-medium text-red-600">{r.totalCount}</td>
                <td className="py-1.5 text-slate-400">{r.observations ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Pesaje ───────────────────────────────────────────────────────────────────

function PesajeSection({ galponId, flockId }: { galponId: number; flockId: number }) {
  const qc = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)

  const [showForm,     setShowForm]     = useState(false)
  const [genderFilter, setGenderFilter] = useState<Gender | 'ALL'>('ALL')
  const [fromDate,     setFromDate]     = useState('')
  const [toDate,       setToDate]       = useState('')
  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null)

  const [form, setForm] = useState({
    sampledBirdsCount: '', averageWeight: '',
    gender: '' as Gender | '', recordDate: today, location: '',
  })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Último pesaje por género para los chips de resumen
  const { data: latestMale }   = useQuery({
    queryKey: ['weight-latest-male',   String(galponId), String(flockId)],
    queryFn:  () => getLatestWeightByFlockGender(galponId, flockId, 'MALE'),
  })
  const { data: latestFemale } = useQuery({
    queryKey: ['weight-latest-female', String(galponId), String(flockId)],
    queryFn:  () => getLatestWeightByFlockGender(galponId, flockId, 'FEMALE'),
  })

  // Lista principal — cambia según filtros activos
  const listKey = ['weight-list', String(galponId), String(flockId), genderFilter, JSON.stringify(appliedRange)]
  const { data = [], isLoading } = useQuery({
    queryKey: listKey,
    queryFn: () => {
      if (appliedRange) return getWeightByFlockRange(galponId, flockId, appliedRange.from, appliedRange.to)
      if (genderFilter !== 'ALL') return getWeightByFlockGender(galponId, flockId, genderFilter)
      return getWeightByFlock(galponId, flockId)
    },
  })

  const mut = useMutation({
    mutationFn: () => createWeight(galponId, {
      flockId,
      sampledBirdsCount: Number(form.sampledBirdsCount),
      averageWeight:     Number(form.averageWeight),
      gender:   (form.gender as Gender) || undefined,
      recordDate: form.recordDate || undefined,
      location:   form.location   || undefined,
    }),
    onSuccess: () => {
      setForm({ sampledBirdsCount: '', averageWeight: '', gender: '', recordDate: today, location: '' })
      setShowForm(false)
      qc.invalidateQueries({ queryKey: ['weight-list',          String(galponId)] })
      qc.invalidateQueries({ queryKey: ['weight-latest-male',   String(galponId)] })
      qc.invalidateQueries({ queryKey: ['weight-latest-female', String(galponId)] })
    },
  })

  const applyRange = () => {
    if (fromDate && toDate) { setAppliedRange({ from: fromDate, to: toDate }); setGenderFilter('ALL') }
  }
  const clearRange = () => { setAppliedRange(null); setFromDate(''); setToDate('') }

  const genderBtnClass = (g: Gender | 'ALL') =>
    `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
      genderFilter === g && !appliedRange
        ? 'bg-brand-600 text-white'
        : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
    }`

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Registros de pesaje</span>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium">
            <PlusCircle size={13} /> Registrar
          </button>
        )}
      </div>

      {/* Resumen último peso ♂ / ♀ */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Último peso ♂', rec: latestMale },
          { label: 'Último peso ♀', rec: latestFemale },
        ].map(({ label, rec }) => (
          <div key={label} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">{label}</span>
            {rec
              ? <span className="text-sm font-bold text-slate-800">{rec.averageWeight.toFixed(3)} kg <span className="text-xs font-normal text-slate-400">· día {rec.ageDays}</span></span>
              : <span className="text-xs text-slate-400 italic">Sin registro</span>
            }
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex gap-1">
          {(['ALL', 'MALE', 'FEMALE'] as const).map((g) => (
            <button key={g} onClick={() => { setGenderFilter(g); clearRange() }} className={genderBtnClass(g)}>
              {g === 'ALL' ? 'Todos' : g === 'MALE' ? 'Machos' : 'Hembras'}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-1.5 ml-auto">
          <div>
            <label className="block text-xs text-slate-400 mb-0.5">De</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-0.5">A</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <button onClick={applyRange} disabled={!fromDate || !toDate}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium disabled:opacity-40">
            Aplicar
          </button>
          {appliedRange && (
            <button onClick={clearRange} className="px-2 py-1.5 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Formulario de registro */}
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }}
          className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Aves muestreadas *</label>
              <input type="number" min="1" className={inputClass} value={form.sampledBirdsCount} onChange={(e) => set('sampledBirdsCount', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Peso promedio (kg) *</label>
              <input type="number" step="0.001" min="0" className={inputClass} value={form.averageWeight} onChange={(e) => set('averageWeight', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Género</label>
              <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="">— Ambos —</option>
                <option value="MALE">Macho</option>
                <option value="FEMALE">Hembra</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
              <input type="date" className={inputClass} value={form.recordDate} onChange={(e) => set('recordDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ubicación</label>
              <input className={inputClass} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Sector A" />
            </div>
          </div>
          {mut.isError && <p className="text-xs text-red-600">{(mut.error as Error).message}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={mut.isPending}
              className="px-3 py-1 text-xs rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-60">
              {mut.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      {isLoading ? <LoadingState /> : data.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Sin registros para el filtro seleccionado.</p>
      ) : (
        <table className="w-full text-xs">
          <thead><tr className="text-left text-slate-400 border-b border-slate-100">
            <th className="py-1.5 pr-3">Fecha</th>
            <th className="py-1.5 pr-3">Día</th>
            <th className="py-1.5 pr-3">Muestras</th>
            <th className="py-1.5 pr-3">Peso prom.</th>
            <th className="py-1.5 pr-3">Género</th>
            <th className="py-1.5">Ubicación</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((r) => (
              <tr key={r.id}>
                <td className="py-1.5 pr-3 text-slate-500">{r.recordDate}</td>
                <td className="py-1.5 pr-3 text-slate-500">{r.ageDays}</td>
                <td className="py-1.5 pr-3">{r.sampledBirdsCount}</td>
                <td className="py-1.5 pr-3 font-medium">{r.averageWeight.toFixed(3)} kg</td>
                <td className="py-1.5 pr-3 text-slate-400">{r.gender ?? '—'}</td>
                <td className="py-1.5 text-slate-400">{r.location ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Consumo ───────────────────────────────────────────────────────────────────

function ConsumoSection({ galponId, flockId }: { galponId: number; flockId: number }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ consumptionDate: today, waterLiters: '', foodKg: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const { data = [], isLoading } = useQuery({
    queryKey: ['consumption', String(galponId)],
    queryFn: () => getConsumption(galponId),
  })

  const mut = useMutation({
    mutationFn: () => createConsumption(galponId, {
      flockId,
      consumptionDate: form.consumptionDate,
      waterLiters: form.waterLiters ? Number(form.waterLiters) : undefined,
      foodKg:      form.foodKg      ? Number(form.foodKg)      : undefined,
    }),
    onSuccess: () => {
      setForm({ consumptionDate: today, waterLiters: '', foodKg: '' })
      setShowForm(false)
      qc.invalidateQueries({ queryKey: ['consumption', String(galponId)] })
    },
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Consumo de agua y alimento</span>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium">
            <PlusCircle size={13} /> Registrar
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }}
          className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha *</label>
              <input type="date" className={inputClass} value={form.consumptionDate} onChange={(e) => set('consumptionDate', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Agua (litros)</label>
              <input type="number" step="0.1" min="0" className={inputClass} value={form.waterLiters} onChange={(e) => set('waterLiters', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Alimento (kg)</label>
              <input type="number" step="0.1" min="0" className={inputClass} value={form.foodKg} onChange={(e) => set('foodKg', e.target.value)} />
            </div>
          </div>
          {mut.isError && <p className="text-xs text-red-600">{(mut.error as Error).message}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={mut.isPending} className="px-3 py-1 text-xs rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-60">
              {mut.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
      {isLoading ? <LoadingState /> : data.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Sin registros de consumo.</p>
      ) : (
        <table className="w-full text-xs">
          <thead><tr className="text-left text-slate-400 border-b border-slate-100">
            <th className="py-1.5 pr-3">Fecha</th>
            <th className="py-1.5 pr-3">Agua (L)</th>
            <th className="py-1.5">Alimento (kg)</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((r) => (
              <tr key={r.id}>
                <td className="py-1.5 pr-3 text-slate-500">{r.consumptionDate}</td>
                <td className="py-1.5 pr-3 font-medium">{r.waterLiters?.toLocaleString('es-MX') ?? '—'}</td>
                <td className="py-1.5 font-medium">{r.foodKg?.toLocaleString('es-MX') ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Flock card ────────────────────────────────────────────────────────────────

function FlockCard({ flock, galponId, onClose }: { flock: Flock; galponId: number; onClose: () => void }) {
  const isActive = flock.status === 'ACTIVE'
  const [expanded, setExpanded] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const qc = useQueryClient()

  const closeMut = useMutation({
    mutationFn: () => closeFlock(galponId, flock.id),
    onSuccess: () => { setConfirmClose(false); onClose(); qc.invalidateQueries({ queryKey: ['flocks', String(galponId)] }) },
  })

  return (
    <div className={`bg-white rounded-xl border-2 p-5 space-y-3 ${isActive ? 'border-brand-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {isActive ? 'Activa' : 'Cerrada'}
            </span>
            {flock.birdLot && <span className="text-xs text-slate-400 font-mono">{flock.birdLot}</span>}
          </div>
          <h3 className="font-bold text-slate-800">{flock.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Inicio: {new Date(flock.flockDate).toLocaleDateString('es-MX')}
            {flock.endedAt && ` · Cierre: ${new Date(flock.endedAt).toLocaleDateString('es-MX')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isActive && !confirmClose && (
            <button onClick={() => setConfirmClose(true)}
              className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-medium">
              Cerrar parvada
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {confirmClose && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-700 font-medium">¿Cerrar esta parvada? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2 ml-4">
            <button onClick={() => setConfirmClose(false)} className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-white">Cancelar</button>
            <button onClick={() => closeMut.mutate()} disabled={closeMut.isPending}
              className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-60">
              {closeMut.isPending ? 'Cerrando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { label: 'Total aves', value: flock.totalBirds.toLocaleString() },
          { label: 'Machos',     value: flock.maleCount?.toLocaleString()   ?? '—' },
          { label: 'Hembras',    value: flock.femaleCount?.toLocaleString() ?? '—' },
          { label: 'Notas',      value: flock.notes ?? '—' },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-slate-400 mb-0.5">{item.label}</p>
            <p className="font-semibold text-slate-700">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Registros productivos — solo para parvada activa expandida */}
      {isActive && expanded && (
        <div className="border-t border-slate-100 pt-4 space-y-6">
          <MortalidadSection galponId={galponId} />
          <PesajeSection    galponId={galponId} flockId={flock.id} />
          <ConsumoSection   galponId={galponId} flockId={flock.id} />
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GalponFlock() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: flocks = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['flocks', id],
    queryFn: () => getFlocks(galponId),
  })

  const hasActive = flocks.some((f) => f.status === 'ACTIVE')
  const active = flocks.find((f) => f.status === 'ACTIVE')
  const closed = flocks.filter((f) => f.status === 'CLOSED')

  const handleDone = () => {
    setShowCreate(false)
    qc.invalidateQueries({ queryKey: ['flocks', id] })
  }

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Parvadas</h2>
        {!showCreate && !hasActive && (
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium">
            <PlusCircle size={15} /> Nueva parvada
          </button>
        )}
      </div>

      {showCreate && (
        <CreateFlockForm galponId={galponId} onDone={handleDone} onCancel={() => setShowCreate(false)} />
      )}

      {isLoading ? <LoadingState /> :
       isError ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> :
       flocks.length === 0 && !showCreate ? (
        <EmptyState
          message="No hay parvadas registradas para este galpón."
          icon={<Bird size={32} className="text-slate-300" />}
          action={
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium">
              <PlusCircle size={16} /> Crear primera parvada
            </button>
          }
        />
       ) : (
        <div className="space-y-4">
          {active && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Parvada activa</p>
              <FlockCard flock={active} galponId={galponId} onClose={() => qc.invalidateQueries({ queryKey: ['flocks', id] })} />
              <p className="text-xs text-slate-400">
                Expande la tarjeta <ChevronDown size={11} className="inline" /> para ver y registrar mortalidad, pesaje y consumo.
              </p>
            </div>
          )}
          {closed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Historial</p>
              {closed.map((f) => (
                <FlockCard key={f.id} flock={f} galponId={galponId} onClose={() => {}} />
              ))}
            </div>
          )}
        </div>
       )}
    </div>
  )
}
