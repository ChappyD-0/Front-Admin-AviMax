import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlusCircle, ArrowRight, Server } from 'lucide-react'
import { getGalpones } from '../api/provisioning'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'

export default function GalponList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['galpones'],
    queryFn: getGalpones,
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{data!.length} galpón(es) registrado(s)</p>
        <Link
          to="/galpones/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        >
          <PlusCircle size={16} />
          Nuevo galpón
        </Link>
      </div>

      {data!.length === 0 ? (
        <EmptyState
          message="No hay galpones registrados."
          action={
            <Link
              to="/galpones/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
            >
              <PlusCircle size={16} /> Crear primer galpón
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600">ID</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Código</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Nombre</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Gateway</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data!.map((g) => (
                <tr key={g.galponId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 font-mono">#{g.galponId}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                      {g.galponCode}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{g.galponName}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs">
                      <Server size={12} />
                      {g.gatewayCode}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/galpones/${g.galponId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                      >
                        Detalle <ArrowRight size={12} />
                      </Link>
                      <Link
                        to={`/galpones/${g.galponId}/provisioning`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                      >
                        Provisioning
                      </Link>
                    </div>
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
