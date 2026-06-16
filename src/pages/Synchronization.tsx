import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, CheckCircle, WifiOff, XCircle, X, AlertTriangle, Loader2 } from 'lucide-react'
import { getDashboardGeneral } from '../api/dashboard'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import RefreshButton from '../components/common/RefreshButton'
import type { GatewayEstado } from '../types'

const syncStateConfig = {
  ONLINE:    { label: 'Online',     color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={16} /> },
  OFFLINE:   { label: 'Offline',    color: 'text-red-600',   bg: 'bg-red-50',   icon: <XCircle size={16} /> },
  SIN_DATOS: { label: 'Sin datos',  color: 'text-slate-400', bg: 'bg-slate-50', icon: <WifiOff size={16} /> },
} satisfies Record<GatewayEstado, { label: string; color: string; bg: string; icon: React.ReactNode }>

type ToastState =
  | { type: 'loading' }
  | { type: 'success'; at: Date }
  | { type: 'error'; message: string }
  | null

function RefreshToast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  if (!toast) return null

  const styles = {
    loading: 'bg-slate-800 text-white border-slate-700',
    success: 'bg-green-700 text-white border-green-600',
    error:   'bg-red-700 text-white border-red-600',
  }

  const icon = {
    loading: <Loader2 size={16} className="animate-spin shrink-0" />,
    success: <CheckCircle size={16} className="shrink-0" />,
    error:   <AlertTriangle size={16} className="shrink-0" />,
  }

  const message = {
    loading: 'Actualizando datos...',
    success: `Datos actualizados · ${(toast as { at: Date }).at?.toLocaleTimeString('es-MX')}`,
    error:   (toast as { message: string }).message,
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all ${styles[toast.type]}`}>
      {icon[toast.type]}
      <span className="flex-1">{message[toast.type]}</span>
      {toast.type !== 'loading' && (
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default function Synchronization() {
  const [toast, setToast] = useState<ToastState>(null)
  const wasManualRefresh = useRef(false)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardGeneral,
    refetchInterval: 15_000,
  })

  useEffect(() => {
    if (!wasManualRefresh.current) return

    if (isFetching) {
      setToast({ type: 'loading' })
      return
    }

    if (isError) {
      setToast({ type: 'error', message: (error as Error).message })
      wasManualRefresh.current = false
      return
    }

    setToast({ type: 'success', at: new Date() })
    wasManualRefresh.current = false

    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    dismissTimer.current = setTimeout(() => setToast(null), 5000)
  }, [isFetching, isError, error])

  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
  }, [])

  const handleRefresh = () => {
    wasManualRefresh.current = true
    refetch()
  }

  if (isLoading) return <LoadingState message="Cargando estado de sincronización..." />
  if (isError && !toast) return <ErrorState message={(error as Error).message} onRetry={handleRefresh} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-700">Estado de sincronización</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitorea la comunicación entre el servidor central y los backends locales.
          </p>
        </div>
        <RefreshButton onClick={handleRefresh} loading={isFetching} />
      </div>

      <RefreshToast toast={toast} onClose={() => setToast(null)} />

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
                      : <span className="text-slate-400 italic">Sin lecturas</span>}
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
