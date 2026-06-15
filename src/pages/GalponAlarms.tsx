import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BellRing } from 'lucide-react'
import { getAlarmsByGalpon } from '../api/alarms'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import StatusBadge from '../components/common/StatusBadge'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'

export default function GalponAlarms() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['alarmas-galpon', id],
    queryFn: () => getAlarmsByGalpon(Number(id)),
    refetchInterval: 30_000,
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Alarmas del galpón</h2>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          message="No hay alarmas activas para este galpón."
          icon={<BellRing size={32} className="text-green-400" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
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
              {data.map((a) => (
                <tr key={a.id} className={`hover:bg-slate-50 ${a.severidad === 'CRITICA' ? 'bg-red-50' : ''}`}>
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
