import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Server, Wifi, WifiOff, AlertCircle, Radio } from 'lucide-react'
import { getGateways } from '../api/galpones'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'
import type { GatewayEstado } from '../types'

const gatewayIcon: Record<GatewayEstado, React.ReactNode> = {
  CONECTADO:    <Wifi size={20} className="text-green-500" />,
  DESCONECTADO: <WifiOff size={20} className="text-red-500" />,
  SIN_DATOS:    <Radio size={20} className="text-slate-400" />,
  ERROR:        <AlertCircle size={20} className="text-red-500" />,
}

const gatewayMessage: Record<GatewayEstado, string> = {
  CONECTADO:    'El gateway está conectado y enviando datos.',
  DESCONECTADO: 'El gateway se ha desconectado del broker MQTT.',
  SIN_DATOS:    'El backend local no ha reportado conexión aún.',
  ERROR:        'El gateway reportó un error de conexión.',
}

export default function GalponGateways() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['gateways', id],
    queryFn: () => getGateways(Number(id)),
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Gateways del galpón</h2>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay gateways registrados para este galpón." icon={<Server size={32} />} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((gw, i) => (
            <div key={gw.id ?? i} className={`bg-white rounded-xl border-2 p-5 space-y-4 ${
              gw.estado === 'CONECTADO' ? 'border-green-200' :
              gw.estado === 'ERROR' || gw.estado === 'DESCONECTADO' ? 'border-red-200' :
              'border-slate-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {gatewayIcon[gw.estado]}
                  <div>
                    <p className="font-semibold text-slate-800">{gw.nombre ?? gw.codigo}</p>
                    <p className="text-xs font-mono text-slate-400">{gw.codigo}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  gw.estado === 'CONECTADO' ? 'bg-green-100 text-green-700' :
                  gw.estado === 'ERROR' || gw.estado === 'DESCONECTADO' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {gw.estado}
                </span>
              </div>

              <p className="text-sm text-slate-500">{gatewayMessage[gw.estado]}</p>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-500">
                {gw.mqttBrokerUrl && (
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Broker MQTT</span>
                    <span className="font-mono">{gw.mqttBrokerUrl}</span>
                  </div>
                )}
                {gw.ultimaConexion && (
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-400">Última conexión</span>
                    <span>{new Date(gw.ultimaConexion).toLocaleString('es-MX')}</span>
                  </div>
                )}
                {!gw.ultimaConexion && (
                  <p className="italic text-slate-400">Sin registro de conexión</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
