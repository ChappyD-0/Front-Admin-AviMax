import { useLocation, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'

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

export default function Topbar() {
  const { pathname } = useLocation()
  const { id } = useParams()
  const label = getLabel(pathname, id)

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-slate-800 font-semibold text-base">{label}</h1>
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        Sistema en línea
      </div>
    </header>
  )
}
