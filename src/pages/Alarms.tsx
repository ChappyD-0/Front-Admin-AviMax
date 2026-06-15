import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { getActiveAlarms } from '../api/alarms'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import StatusBadge from '../components/common/StatusBadge'
import RefreshButton from '../components/common/RefreshButton'
import type { AlertaSeveridad } from '../types'

export default function Alarms() {
  const [filterSeveridad, setFilterSeveridad] = useState<AlertaSeveridad | 'ALL'>('ALL')

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['alarmas-activas'],
    queryFn: getActiveAlarms,
    refetchInterval: 30_000,
  })

  const filtered = data?.filter(
    (a) => filterSeveridad === 'ALL' || a.severidad === filterSeveridad
  ) ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Alarmas activas — todos los galpones</h2>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['ALL', 'NORMAL', 'ADVERTENCIA', 'CRITICA'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterSeveridad(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterSeveridad === s
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {s === 'ALL' ? 'Todas' : s === 'ADVERTENCIA' ? 'Advertencia' : s === 'CRITICA' ? 'Crítica' : 'Normal'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No hay alarmas activas en este momento."
          icon={<BellRing size={32} className="text-green-400" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600">Galpón</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Sensor</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Variable</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Valor</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Regla</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Severidad</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Estado</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className={`hover:bg-slate-50 ${a.severidad === 'CRITICA' ? 'bg-red-50' : ''}`}>
                  <td className="px-5 py-3 text-slate-700 font-medium">{a.galponNombre}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{a.sensorCodigo}</td>
                  <td className="px-5 py-3 text-slate-700">{a.variable}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{a.valorDetectado}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{a.reglaActivada}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.severidad} size="sm" /></td>
                  <td className="px-5 py-3"><StatusBadge status={a.estado} size="sm" /></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{new Date(a.timestamp).toLocaleString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
