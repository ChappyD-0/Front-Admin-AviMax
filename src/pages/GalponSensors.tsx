import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Cpu } from 'lucide-react'
import { getSensores } from '../api/galpones'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'

const tipoLabel: Record<string, string> = {
  TEMPERATURA: 'Temperatura',
  HUMEDAD: 'Humedad',
  AMONIACO: 'Amoníaco',
  OTRO: 'Otro',
}

export default function GalponSensors() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['sensores', id],
    queryFn: () => getSensores(Number(id)),
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Sensores del galpón</h2>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay sensores registrados para este galpón." icon={<Cpu size={32} />} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600">ID</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Código</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Nombre</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Tipo</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Unidad</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Estado</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Última lectura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((s, i) => (
                <tr key={s.id ?? i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{s.id ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{s.codigo}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{s.nombre}</td>
                  <td className="px-5 py-3 text-slate-500">{tipoLabel[s.tipo] ?? s.tipo}</td>
                  <td className="px-5 py-3 text-slate-500">{s.unidad}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.estado === 'ACTIVO' || !s.estado
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.estado ?? 'ACTIVO'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {s.ultimaLectura ? new Date(s.ultimaLectura).toLocaleString('es-MX') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
