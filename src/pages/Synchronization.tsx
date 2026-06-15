import { useQuery } from '@tanstack/react-query'
import { RefreshCw, CheckCircle, Clock, AlertCircle, WifiOff, XCircle } from 'lucide-react'
import { getDashboardGeneral } from '../api/dashboard'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import RefreshButton from '../components/common/RefreshButton'
import type { GatewayEstado } from '../types'

const syncStateConfig = {
  CONECTADO:    { label: 'Conectado',   color: 'text-green-600', bg: 'bg-green-50',  icon: <CheckCircle size={16} /> },
  DESCONECTADO: { label: 'Desconectado', color: 'text-red-600',   bg: 'bg-red-50',    icon: <XCircle size={16} /> },
  SIN_DATOS:    { label: 'Sin datos',   color: 'text-slate-400', bg: 'bg-slate-50',  icon: <WifiOff size={16} /> },
  ERROR:        { label: 'Error',       color: 'text-red-600',   bg: 'bg-red-50',    icon: <AlertCircle size={16} /> },
} satisfies Record<GatewayEstado, { label: string; color: string; bg: string; icon: React.ReactNode }>

export default function Synchronization() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardGeneral,
    refetchInterval: 15_000,
  })

  if (isLoading) return <LoadingState message="Cargando estado de sincronización..." />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-700">Estado de sincronización</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitorea la comunicación entre el servidor central y los backends locales.
          </p>
        </div>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data!.galpones.map((g) => {
          const cfg = syncStateConfig[g.gatewayEstado] ?? syncStateConfig.SIN_DATOS
          return (
            <div key={g.galponId} className={`rounded-xl border p-5 space-y-4 ${cfg.bg} border-slate-200`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                      {g.codigo}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800">{g.nombre}</h3>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Estado gateway</span>
                  <span className={`font-medium ${cfg.color}`}>{g.gatewayEstado}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Última lectura</span>
                  <span>
                    {g.ultimaLectura
                      ? new Date(g.ultimaLectura).toLocaleString('es-MX')
                      : <span className="text-slate-400 italic">Sin lecturas</span>
                    }
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Alarmas activas</span>
                  <span className={g.alertasActivas > 0 ? 'text-red-600 font-bold' : ''}>
                    {g.alertasActivas}
                  </span>
                </div>
              </div>

              {g.gatewayEstado === 'SIN_DATOS' && (
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500">
                  La configuración está guardada en central. El backend local sincronizará al conectarse.
                </div>
              )}

              {/* MQTT Topics hint */}
              <div className="border-t border-white/60 pt-3 space-y-1 text-xs text-slate-500">
                <p className="font-medium text-slate-400 mb-1">Tópicos MQTT</p>
                <p className="font-mono">avicola/galpon/{g.galponId}/lecturas</p>
                <p className="font-mono">avicola/galpon/{g.galponId}/sync/#</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
