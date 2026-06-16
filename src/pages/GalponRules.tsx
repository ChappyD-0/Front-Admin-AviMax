import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Settings2, Plus, Save, X, Power } from 'lucide-react'
import { getRules, createRule, updateRule, toggleRuleActive } from '../api/alarms'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import StatusBadge from '../components/common/StatusBadge'
import GalponTabs from '../components/common/GalponTabs'
import type { Regla, AlertaSeveridad, CreateRuleBody } from '../types'

const VARIABLES = ['TEMPERATURA', 'HUMEDAD', 'AMONIACO'] as const
const SEVERIDADES: AlertaSeveridad[] = ['NORMAL', 'ADVERTENCIA', 'CRITICA']

// ── Create rule form ──────────────────────────────────────────────────────────

function CreateRuleForm({ galponId, onDone }: { galponId: number; onDone: () => void }) {
  const qc = useQueryClient()
  const [nombre,       setNombre]       = useState('')
  const [variableTipo, setVariableTipo] = useState('TEMPERATURA')
  const [min,          setMin]          = useState('')
  const [max,          setMax]          = useState('')
  const [severidad,    setSeveridad]    = useState<AlertaSeveridad>('ADVERTENCIA')
  const [err,          setErr]          = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const body: CreateRuleBody = {
        nombre, variableTipo, severidad, galponId, activa: true,
        ...(min !== '' ? { umbralMinimo: Number(min) } : {}),
        ...(max !== '' ? { umbralMaximo: Number(max) } : {}),
      }
      return createRule(body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reglas', String(galponId)] })
      onDone()
    },
    onError: (e: Error) => setErr(e.message),
  })

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-brand-800 text-sm">Nueva regla de alarma</p>
        <button onClick={onDone} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
          <input
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            placeholder="Temperatura crítica alta"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Variable</label>
          <select
            value={variableTipo} onChange={(e) => setVariableTipo(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {VARIABLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Severidad</label>
          <select
            value={severidad} onChange={(e) => setSeveridad(e.target.value as AlertaSeveridad)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {SEVERIDADES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Umbral mínimo</label>
          <input
            type="number" step="0.1" value={min} onChange={(e) => setMin(e.target.value)}
            placeholder="Opcional"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Umbral máximo</label>
          <input
            type="number" step="0.1" value={max} onChange={(e) => setMax(e.target.value)}
            placeholder="Opcional"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !nombre}
        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
      >
        {mutation.isPending ? 'Creando…' : 'Crear regla'}
      </button>
    </div>
  )
}

// ── Rule row ──────────────────────────────────────────────────────────────────

function RuleRow({ rule, galponId }: { rule: Regla; galponId: number }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [nombre,    setNombre]    = useState(rule.nombre)
  const [variable,  setVariable]  = useState(rule.variableTipo)
  const [min,       setMin]       = useState(String(rule.umbralMinimo ?? ''))
  const [max,       setMax]       = useState(String(rule.umbralMaximo ?? ''))
  const [severidad, setSeveridad] = useState<AlertaSeveridad>(rule.severidad)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['reglas', String(galponId)] })

  const saveMutation = useMutation({
    mutationFn: () =>
      updateRule(rule.id, {
        nombre, variableTipo: variable, severidad,
        ...(min !== '' ? { umbralMinimo: Number(min) } : { umbralMinimo: undefined }),
        ...(max !== '' ? { umbralMaximo: Number(max) } : { umbralMaximo: undefined }),
      }),
    onSuccess: () => { invalidate(); setEditing(false) },
  })

  const toggleMutation = useMutation({
    mutationFn: () => toggleRuleActive(rule.id, !rule.activa),
    onSuccess: invalidate,
  })

  if (editing) {
    return (
      <tr className="border-b border-slate-100 bg-blue-50">
        <td className="px-4 py-2.5">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)}
            className="w-full px-2 py-1 rounded border border-slate-300 text-sm" />
        </td>
        <td className="px-4 py-2.5">
          <select value={variable} onChange={(e) => setVariable(e.target.value)}
            className="px-2 py-1 rounded border border-slate-300 text-sm">
            {VARIABLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </td>
        <td className="px-4 py-2.5">
          <input type="number" step="0.1" value={min} onChange={(e) => setMin(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-slate-300 text-sm" />
        </td>
        <td className="px-4 py-2.5">
          <input type="number" step="0.1" value={max} onChange={(e) => setMax(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-slate-300 text-sm" />
        </td>
        <td className="px-4 py-2.5">
          <select value={severidad} onChange={(e) => setSeveridad(e.target.value as AlertaSeveridad)}
            className="px-2 py-1 rounded border border-slate-300 text-sm">
            {SEVERIDADES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
        <td className="px-4 py-2.5" />
        <td className="px-4 py-2.5">
          <div className="flex gap-2">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-medium"
            >
              <Save size={11} /> {saveMutation.isPending ? '…' : 'Guardar'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2.5 py-1 border border-slate-300 text-slate-500 rounded text-xs"
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 font-medium text-slate-800">{rule.nombre}</td>
      <td className="px-4 py-3 text-slate-500 text-xs">{rule.variableTipo}</td>
      <td className="px-4 py-3 text-slate-700">{rule.umbralMinimo ?? '—'}</td>
      <td className="px-4 py-3 text-slate-700">{rule.umbralMaximo ?? '—'}</td>
      <td className="px-4 py-3"><StatusBadge status={rule.severidad} size="sm" /></td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          rule.activa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {rule.activa ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            title={rule.activa ? 'Desactivar' : 'Activar'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium disabled:opacity-50 ${
              rule.activa
                ? 'border border-slate-300 text-slate-500 hover:bg-slate-100'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <Power size={11} />
            {rule.activa ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GalponRules() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reglas', id],
    queryFn: () => getRules({ galponId }),
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Reglas de alarma</h2>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            <Plus size={14} /> Nueva regla
          </button>
        )}
      </div>

      {showCreate && (
        <CreateRuleForm galponId={galponId} onDone={() => setShowCreate(false)} />
      )}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay reglas configuradas para este galpón." icon={<Settings2 size={32} />} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Nombre</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Variable</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Mín.</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Máx.</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Severidad</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Estado</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <RuleRow key={r.id} rule={r} galponId={galponId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
