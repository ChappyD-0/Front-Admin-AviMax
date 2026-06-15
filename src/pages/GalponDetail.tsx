import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Thermometer, Droplets, Wind, BellRing, Zap, Server } from 'lucide-react'
import { getDashboardGeneral } from '../api/dashboard'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import StatusBadge from '../components/common/StatusBadge'
import GalponTabs from '../components/common/GalponTabs'
import type { GalponDashboard } from '../types'

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

export default function GalponDetail() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardGeneral,
    refetchInterval: 30_000,
  })

  if (isLoading) return <LoadingState message="Cargando galpón..." />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />

  const g: GalponDashboard | undefined = data!.galpones.find(
    (x) => String(x.galponId) === id
  )

  if (!g) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <p className="text-red-700 font-medium">El galpón solicitado no existe o no ha sido creado aún.</p>
      </div>
    )
  }

  const gatewayColor =
    g.gatewayEstado === 'CONECTADO' ? 'text-green-600' :
    g.gatewayEstado === 'DESCONECTADO' || g.gatewayEstado === 'ERROR' ? 'text-red-600' :
    'text-slate-400'

  return (
    <div className="space-y-6">
      <GalponTabs id={id!} />

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-sm">{g.codigo}</span>
            <StatusBadge status={g.estado} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{g.nombre}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Gateway</p>
          <div className={`flex items-center gap-1.5 justify-end font-medium text-sm ${gatewayColor}`}>
            <Server size={14} />
            {g.gatewayEstado === 'SIN_DATOS' ? 'Sin datos' : g.gatewayEstado}
          </div>
          {g.ultimaLectura && (
            <p className="text-xs text-slate-400 mt-1">
              Última lectura: {new Date(g.ultimaLectura).toLocaleString('es-MX')}
            </p>
          )}
          {!g.ultimaLectura && (
            <p className="text-xs text-slate-400 mt-1 italic">Sin lecturas</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Lectura actual */}
        <InfoCard title="Lectura actual">
          {g.lecturaActual ? (
            <div className="space-y-3">
              {g.lecturaActual.temperatura !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <Thermometer size={14} className="text-orange-500" /> Temperatura
                  </span>
                  <span className="font-bold text-slate-800">{g.lecturaActual.temperatura.toFixed(1)} °C</span>
                </div>
              )}
              {g.lecturaActual.humedad !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <Droplets size={14} className="text-blue-500" /> Humedad
                  </span>
                  <span className="font-bold text-slate-800">{g.lecturaActual.humedad.toFixed(0)} %</span>
                </div>
              )}
              {g.lecturaActual.amoniaco !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <Wind size={14} className="text-purple-500" /> Amoníaco
                  </span>
                  <span className="font-bold text-slate-800">{g.lecturaActual.amoniaco.toFixed(1)} ppm</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No se han recibido lecturas para este galpón.</p>
          )}
        </InfoCard>

        {/* Parvada activa */}
        <InfoCard title="Parvada activa">
          {g.parvada ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-slate-800">{g.parvada.nombre}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-400">Día</p>
                  <p className="font-bold text-slate-700">{g.parvada.dia}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-400">Aves iniciales</p>
                  <p className="font-bold text-slate-700">{g.parvada.avesIniciales.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-400">Aves actuales</p>
                  <p className="font-bold text-slate-700">{g.parvada.avesActuales.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-400">Mort. hoy</p>
                  <p className="font-bold text-slate-700">{g.parvada.mortalidadHoy}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Este galpón no tiene una parvada activa.</p>
          )}
        </InfoCard>

        {/* Alertas y actuadores */}
        <div className="space-y-4">
          <InfoCard title="Alertas activas">
            <div className="flex items-center gap-3">
              <BellRing size={20} className={g.alertasActivas > 0 ? 'text-red-500' : 'text-slate-300'} />
              <span className="text-2xl font-bold text-slate-800">{g.alertasActivas}</span>
              {g.alertasActivas > 0 && (
                <span className="text-sm text-red-600 font-medium">Requieren atención</span>
              )}
            </div>
          </InfoCard>

          <InfoCard title="Actuadores activos">
            <div className="flex gap-4 text-sm">
              <div className="flex flex-col items-center">
                <Zap size={16} className={g.actuadoresActivos.extractoresOn > 0 ? 'text-brand-500' : 'text-slate-300'} />
                <span className="font-bold text-slate-700 mt-1">{g.actuadoresActivos.extractoresOn}</span>
                <span className="text-xs text-slate-400">Ext.</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap size={16} className={g.actuadoresActivos.criadorasOn > 0 ? 'text-orange-500' : 'text-slate-300'} />
                <span className="font-bold text-slate-700 mt-1">{g.actuadoresActivos.criadorasOn}</span>
                <span className="text-xs text-slate-400">Cri.</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap size={16} className={g.actuadoresActivos.bombasOn > 0 ? 'text-blue-500' : 'text-slate-300'} />
                <span className="font-bold text-slate-700 mt-1">{g.actuadoresActivos.bombasOn}</span>
                <span className="text-xs text-slate-400">Bom.</span>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Gateway offline notice */}
      {g.gatewayEstado === 'SIN_DATOS' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-600">
          El backend local no ha reportado conexión aún. Usa la sección de{' '}
          <a href={`/galpones/${id}/provisioning`} className="text-brand-600 underline">Provisioning</a>{' '}
          para obtener el comando de arranque.
        </div>
      )}
    </div>
  )
}
