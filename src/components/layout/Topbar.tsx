import { useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getHealth, getMqttStatus } from '../../api/status'

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard General',
  '/galpones': 'Galpones',
  '/galpones/nuevo': 'Nuevo Galpón',
  '/alarmas': 'Alarmas Activas',
  '/sincronizacion': 'Sincronización',
  '/configuracion': 'Configuración',
}

function getLabel(pathname: string, id?: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname]
  if (!id) return pathname

  const sub = pathname.split(`/galpones/${id}`)[1] ?? ''
  const subLabels: Record<string, string> = {
    '': `Galpón #${id}`,
    '/lecturas': `Lecturas — Galpón #${id}`,
    '/sensores': `Sensores — Galpón #${id}`,
    '/gateways': `Gateways — Galpón #${id}`,
    '/actuadores': `Actuadores — Galpón #${id}`,
    '/actuadores/programacion': `Programación — Galpón #${id}`,
    '/alarmas': `Alarmas — Galpón #${id}`,
    '/reglas': `Reglas — Galpón #${id}`,
    '/parvada': `Parvada — Galpón #${id}`,
    '/provisioning': `Provisioning — Galpón #${id}`,
  }
  return subLabels[sub] ?? `Galpón #${id}`
}

interface StatusDotProps {
  ok: boolean
  loading: boolean
  label: string
}

function StatusDot({ ok, loading, label }: StatusDotProps) {
  const color = loading
    ? 'bg-slate-300'
    : ok
    ? 'bg-green-500'
    : 'bg-red-500'

  const pulse = loading || ok

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <div className={`w-2 h-2 rounded-full ${color} ${pulse && !loading ? 'animate-pulse' : ''}`} />
      <span className={`text-xs font-medium ${ok && !loading ? 'text-slate-500' : loading ? 'text-slate-400' : 'text-red-500'}`}>
        {label}
      </span>
    </div>
  )
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { id } = useParams()
  const label = getLabel(pathname, id)

  const { data: health, isLoading: loadingHealth } = useQuery({
    queryKey: ['status-health'],
    queryFn: getHealth,
    refetchInterval: 30_000,
    retry: false,
  })

  const { data: mqtt, isLoading: loadingMqtt } = useQuery({
    queryKey: ['status-mqtt'],
    queryFn: getMqttStatus,
    refetchInterval: 30_000,
    retry: false,
  })

  const apiOk = health?.status === 'OK'
  const dbOk = health?.database === 'UP'
  const mqttOk = mqtt?.connected === true

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-slate-800 font-semibold text-base">{label}</h1>
      <div className="flex items-center gap-4">
        <StatusDot ok={apiOk} loading={loadingHealth} label="API" />
        <StatusDot ok={dbOk} loading={loadingHealth} label="BD" />
        <StatusDot ok={mqttOk} loading={loadingMqtt} label="MQTT" />
      </div>
    </header>
  )
}
