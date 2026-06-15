import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap, ZapOff, Settings2 } from 'lucide-react'
import { getActuadores, sendActuadorCommand } from '../api/actuators'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'
import type { Actuador } from '../types'

const tipoLabel: Record<string, string> = {
  EXTRACTOR: 'Extractor',
  CRIADORA: 'Criadora',
  BOMBA: 'Bomba',
}

const tipoColor: Record<string, string> = {
  EXTRACTOR: 'text-brand-600',
  CRIADORA:  'text-orange-500',
  BOMBA:     'text-blue-500',
}

function ActuadorCard({ a, galponId }: { a: Actuador; galponId: number }) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (action: 'ON' | 'OFF') => sendActuadorCommand(galponId, a.id!, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['actuadores', String(galponId)] }),
  })

  return (
    <div className={`bg-white rounded-xl border-2 p-5 space-y-4 ${a.estado ? 'border-brand-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${a.estado ? 'bg-brand-50' : 'bg-slate-50'}`}>
            {a.estado
              ? <Zap size={18} className={tipoColor[a.tipo] ?? 'text-slate-500'} />
              : <ZapOff size={18} className="text-slate-400" />
            }
          </div>
          <div>
            <p className="font-semibold text-slate-800">{a.nombre}</p>
            <p className="text-xs text-slate-400">{tipoLabel[a.tipo] ?? a.tipo}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.estado ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {a.estado ? 'ON' : 'OFF'}
          </span>
          <span className="text-xs text-slate-400">{a.modo}</span>
        </div>
      </div>

      {a.ultimaActivacion && (
        <p className="text-xs text-slate-400">
          Última activación: {new Date(a.ultimaActivacion).toLocaleString('es-MX')}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate('ON')}
          disabled={mutation.isPending || a.estado}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Encender
        </button>
        <button
          onClick={() => mutation.mutate('OFF')}
          disabled={mutation.isPending || !a.estado}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          Apagar
        </button>
      </div>

      {mutation.isError && (
        <p className="text-xs text-red-600">{(mutation.error as Error).message}</p>
      )}
    </div>
  )
}

export default function GalponActuators() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['actuadores', id],
    queryFn: () => getActuadores(Number(id)),
    refetchInterval: 15_000,
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Actuadores del galpón</h2>
        <div className="flex gap-2">
          <RefreshButton onClick={() => refetch()} loading={isFetching} />
          <Link
            to={`/galpones/${id}/actuadores/programacion`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium"
          >
            <Settings2 size={14} /> Programación
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay actuadores registrados para este galpón." icon={<Zap size={32} />} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((a, i) => (
            <ActuadorCard key={a.id ?? i} a={a} galponId={Number(id)} />
          ))}
        </div>
      )}
    </div>
  )
}
