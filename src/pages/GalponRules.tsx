import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Settings2, Save } from 'lucide-react'
import { getReglas, updateRegla } from '../api/galpones'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import StatusBadge from '../components/common/StatusBadge'
import GalponTabs from '../components/common/GalponTabs'
import type { Regla } from '../types'

function RuleRow({ rule, galponId }: { rule: Regla; galponId: number }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [min, setMin] = useState(String(rule.umbralMinimo ?? ''))
  const [max, setMax] = useState(String(rule.umbralMaximo ?? ''))

  const mutation = useMutation({
    mutationFn: () =>
      updateRegla(galponId, rule.id, {
        umbralMinimo: min !== '' ? Number(min) : undefined,
        umbralMaximo: max !== '' ? Number(max) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reglas', String(galponId)] })
      setEditing(false)
    },
  })

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-3 font-medium text-slate-800">{rule.nombre}</td>
      <td className="px-5 py-3 text-slate-500">{rule.variableTipo}</td>
      <td className="px-5 py-3">
        {editing ? (
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-slate-300 text-sm"
          />
        ) : (
          <span className="text-slate-700">{rule.umbralMinimo ?? '—'}</span>
        )}
      </td>
      <td className="px-5 py-3">
        {editing ? (
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-slate-300 text-sm"
          />
        ) : (
          <span className="text-slate-700">{rule.umbralMaximo ?? '—'}</span>
        )}
      </td>
      <td className="px-5 py-3"><StatusBadge status={rule.severidad} size="sm" /></td>
      <td className="px-5 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          rule.activa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {rule.activa ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td className="px-5 py-3">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-medium"
            >
              <Save size={12} /> {mutation.isPending ? '...' : 'Guardar'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2.5 py-1 border border-slate-300 text-slate-500 rounded text-xs"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
          >
            Editar
          </button>
        )}
      </td>
    </tr>
  )
}

export default function GalponRules() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reglas', id],
    queryFn: () => getReglas(Number(id)),
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />
      <h2 className="font-semibold text-slate-700">Reglas de alarma</h2>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay reglas configuradas para este galpón." icon={<Settings2 size={32} />} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600">Nombre</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Variable</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Mín.</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Máx.</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Severidad</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Estado</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((r) => (
                <RuleRow key={r.id} rule={r} galponId={Number(id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
