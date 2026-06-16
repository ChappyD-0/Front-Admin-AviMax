import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Thermometer, Droplets, Wind, BellRing, Zap, Server, Users, MapPin } from 'lucide-react'
import { getGalpon } from '../api/galpones'
import { getDashboardGeneral } from '../api/dashboard'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import GalponTabs from '../components/common/GalponTabs'
import type { GalponDashboard, GalponEstadoCrud } from '../types'

const estadoStyles: Record<GalponEstadoCrud, string> = {
  ACTIVO:        'bg-green-100 text-green-700',
  INACTIVO:      'bg-slate-100 text-slate-500',
  MANTENIMIENTO: 'bg-yellow-100 text-yellow-700',
}

const estadoLabel: Record<GalponEstadoCrud, string> = {
  ACTIVO:        'Activo',
  INACTIVO:      'Inactivo',
  MANTENIMIENTO: 'Mantenimiento',
}

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
  const galponId = Number(id)

  const { data: galpon, isLoading: loadingGalpon, isError: errorGalpon, error: galponError, refetch: refetchGalpon } =
    useQuery({
      queryKey: ['galpon', id],
      queryFn: () => getGalpon(galponId),
    })

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardGeneral,
    refetchInterval: 30_000,
  })

  if (loadingGalpon) return <LoadingState message="Cargando galpón..." />
  if (errorGalpon) return <ErrorState message={(galponError as Error).message} onRetry={() => refetchGalpon()} />

  const live: GalponDashboard | undefined = dashboard?.galpones.find(
    (x) => x.galponId === galponId
  )

  const gatewayColor =
    live?.gatewayEstado === 'ONLINE'  ? 'text-green-600' :
    live?.gatewayEstado === 'OFFLINE' ? 'text-red-600' :
    'text-slate-400'

  return (
    <div className="space-y-6">
      <GalponTabs id={id!} />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-sm">
                {galpon!.codigo}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoStyles[galpon!.estado]}`}>
                {estadoLabel[galpon!.estado]}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{galpon!.nombre}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {galpon!.ubicacion && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {galpon!.ubicacion}
                </span>
              )}
              {galpon!.responsable && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} /> {galpon!.responsable}
                </span>
              )}
              {galpon!.capacidadAves > 0 && (
                <span className="text-slate-400">
                  Capacidad: {galpon!.capacidadAves.toLocaleString('es-MX')} aves
                </span>
              )}
            </div>
          </div>

          {live && (
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Gateway</p>
              <div className={`flex items-center gap-1.5 justify-end font-medium text-sm ${gatewayColor}`}>
                <Server size={14} />
                {live.gatewayEstado === 'ONLINE' ? 'Online' : live.gatewayEstado === 'OFFLINE' ? 'Offline' : 'Sin datos'}
              </div>
              {live.ultimaLectura ? (
                <p className="text-xs text-slate-400 mt-1">
                  Última lectura: {new Date(live.ultimaLectura).toLocaleString('es-MX')}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1 italic">Sin lecturas</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live data — solo si el dashboard devuelve datos para este galpón */}
      {live ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard title="Lectura actual">
            {live.lecturaActual ? (
              <div className="space-y-3">
                {live.lecturaActual.temperatura !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <Thermometer size={14} className="text-orange-500" /> Temperatura
                    </span>
                    <span className="font-bold text-slate-800">{live.lecturaActual.temperatura.toFixed(1)} °C</span>
                  </div>
                )}
                {live.lecturaActual.humedad !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <Droplets size={14} className="text-blue-500" /> Humedad
                    </span>
                    <span className="font-bold text-slate-800">{live.lecturaActual.humedad.toFixed(0)} %</span>
                  </div>
                )}
                {live.lecturaActual.amoniaco !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <Wind size={14} className="text-purple-500" /> Amoníaco
                    </span>
                    <span className="font-bold text-slate-800">{live.lecturaActual.amoniaco.toFixed(1)} ppm</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Sin lecturas recientes.</p>
            )}
          </InfoCard>

          <InfoCard title="Parvada activa">
            {live.parvada ? (
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-slate-800">{live.parvada.nombre}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Día</p>
                    <p className="font-bold text-slate-700">{live.parvada.dia}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Aves iniciales</p>
                    <p className="font-bold text-slate-700">{live.parvada.avesIniciales.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Aves actuales</p>
                    <p className="font-bold text-slate-700">{live.parvada.avesActuales.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Mort. hoy</p>
                    <p className="font-bold text-slate-700">{live.parvada.mortalidadHoy}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Sin parvada activa.</p>
            )}
          </InfoCard>

          <div className="space-y-4">
            <InfoCard title="Alertas activas">
              <div className="flex items-center gap-3">
                <BellRing size={20} className={live.alertasActivas > 0 ? 'text-red-500' : 'text-slate-300'} />
                <span className="text-2xl font-bold text-slate-800">{live.alertasActivas}</span>
                {live.alertasActivas > 0 && (
                  <span className="text-sm text-red-600 font-medium">Requieren atención</span>
                )}
              </div>
            </InfoCard>

            <InfoCard title="Actuadores activos">
              <div className="flex gap-4 text-sm">
                <div className="flex flex-col items-center">
                  <Zap size={16} className={live.actuadoresActivos.extractoresOn > 0 ? 'text-brand-500' : 'text-slate-300'} />
                  <span className="font-bold text-slate-700 mt-1">{live.actuadoresActivos.extractoresOn}</span>
                  <span className="text-xs text-slate-400">Ext.</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap size={16} className={live.actuadoresActivos.criadorasOn > 0 ? 'text-orange-500' : 'text-slate-300'} />
                  <span className="font-bold text-slate-700 mt-1">{live.actuadoresActivos.criadorasOn}</span>
                  <span className="text-xs text-slate-400">Cri.</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap size={16} className={live.actuadoresActivos.bombasOn > 0 ? 'text-blue-500' : 'text-slate-300'} />
                  <span className="font-bold text-slate-700 mt-1">{live.actuadoresActivos.bombasOn}</span>
                  <span className="text-xs text-slate-400">Bom.</span>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-600">
          El gateway aún no ha reportado datos en tiempo real. Usa la sección de{' '}
          <a href={`/galpones/${id}/provisioning`} className="text-brand-600 underline">Provisioning</a>{' '}
          para obtener el comando de arranque.
        </div>
      )}
    </div>
  )
}
