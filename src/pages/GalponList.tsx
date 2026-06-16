import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlusCircle, ArrowRight } from 'lucide-react'
import { getAllGalpones } from '../api/galpones'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import type { GalponEstadoCrud } from '../types'

const estadoStyles: Record<GalponEstadoCrud, string> = {
  ACTIVO:       'bg-green-100 text-green-700',
  INACTIVO:     'bg-slate-100 text-slate-500',
  MANTENIMIENTO:'bg-yellow-100 text-yellow-700',
}

const estadoLabel: Record<GalponEstadoCrud, string> = {
  ACTIVO:        'Activo',
  INACTIVO:      'Inactivo',
  MANTENIMIENTO: 'Mantenimiento',
}

export default function GalponList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['galpones'],
    queryFn: getAllGalpones,
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
                <th className="px-5 py-3 font-semibold text-slate-600">Código</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Nombre</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Ubicación</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Responsable</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Capacidad</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Estado</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data!.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                      {g.codigo}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{g.nombre}</td>
                  <td className="px-5 py-3 text-slate-500">{g.ubicacion || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{g.responsable || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {g.capacidadAves ? g.capacidadAves.toLocaleString('es-MX') : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoStyles[g.estado]}`}>
                      {estadoLabel[g.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/galpones/${g.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                    >
                      Ver detalle <ArrowRight size={12} />
                    </Link>
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
