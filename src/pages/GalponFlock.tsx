import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bird, PlusCircle } from 'lucide-react'
import { getParvada } from '../api/galpones'
import LoadingState from '../components/common/LoadingState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'

export default function GalponFlock() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parvada', id],
    queryFn: () => getParvada(Number(id)),
    retry: false,
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />
      <h2 className="font-semibold text-slate-700">Parvada activa</h2>

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <EmptyState
          message="Este galpón no tiene una parvada activa."
          icon={<Bird size={32} className="text-slate-300" />}
          action={
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
              onClick={() => alert('Funcionalidad de creación de parvada próximamente')}
            >
              <PlusCircle size={16} /> Crear parvada
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Main card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-brand-50 p-3 rounded-xl">
                <Bird size={24} className="text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{data.nombre}</h3>
                <p className="text-sm text-slate-400">
                  Iniciada: {new Date(data.fechaInicio).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {data.estado}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Día actual',          value: data.diaActual },
                { label: 'Aves iniciales',       value: data.avesIniciales.toLocaleString() },
                { label: 'Aves actuales',        value: data.avesActuales.toLocaleString() },
                { label: 'Mortalidad hoy',       value: data.mortalidadHoy },
                { label: 'Mortalidad acum.',     value: data.mortalidadAcumulada },
                {
                  label: 'Mort. %',
                  value: ((data.mortalidadAcumulada / data.avesIniciales) * 100).toFixed(2) + '%'
                },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <p className="text-xl font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
