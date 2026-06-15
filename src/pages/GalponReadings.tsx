import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Thermometer, Droplets, Wind, Clock, Cpu } from 'lucide-react'
import { getLecturaLatest } from '../api/galpones'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'

function ReadingCard({ icon, label, value, unit, color }: {
  icon: React.ReactNode; label: string; value?: number; unit: string; color: string
}) {
  const isNormal = value !== undefined && value < 35
  const level = value === undefined ? 'SIN_DATOS' : isNormal ? 'NORMAL' : 'ADVERTENCIA'
  const levelColor = level === 'NORMAL' ? 'text-green-600' : level === 'ADVERTENCIA' ? 'text-yellow-600' : 'text-slate-400'

  return (
    <div className={`bg-white rounded-xl border-2 border-slate-200 p-6 flex flex-col gap-3`}>
      <div className={`p-3 rounded-lg w-fit ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {value !== undefined ? (
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {value.toFixed(1)} <span className="text-base font-normal text-slate-400">{unit}</span>
          </p>
        ) : (
          <p className="text-2xl font-bold text-slate-400 mt-1">—</p>
        )}
        <p className={`text-xs font-medium mt-1 ${levelColor}`}>{level.replace('_', ' ')}</p>
      </div>
    </div>
  )
}

export default function GalponReadings() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['lecturas-latest', id],
    queryFn: () => getLecturaLatest(Number(id)),
    refetchInterval: 15_000,
    retry: false,
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Lectura más reciente</h2>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      {isLoading ? (
        <LoadingState message="Cargando lecturas..." />
      ) : isError ? (
        <EmptyState
          message="No se han recibido lecturas para este galpón todavía."
          icon={<Thermometer size={32} className="text-slate-300" />}
        />
      ) : data ? (
        <>
          {/* Timestamp & source */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {new Date(data.timestamp).toLocaleString('es-MX')}
            </span>
            {data.sensorCodigo && (
              <span className="flex items-center gap-1.5">
                <Cpu size={12} />
                Sensor: {data.sensorCodigo}
              </span>
            )}
            {data.gatewayCodigo && (
              <span>Gateway: {data.gatewayCodigo}</span>
            )}
          </div>

          {/* Reading cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ReadingCard
              icon={<Thermometer size={22} className="text-orange-600" />}
              label="Temperatura"
              value={data.temperatura}
              unit="°C"
              color="bg-orange-50"
            />
            <ReadingCard
              icon={<Droplets size={22} className="text-blue-600" />}
              label="Humedad"
              value={data.humedad}
              unit="%"
              color="bg-blue-50"
            />
            <ReadingCard
              icon={<Wind size={22} className="text-purple-600" />}
              label="Amoníaco (NH₃)"
              value={data.amoniaco}
              unit="ppm"
              color="bg-purple-50"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-500">
            Los datos se actualizan automáticamente cada 15 segundos.
          </div>
        </>
      ) : null}
    </div>
  )
}
