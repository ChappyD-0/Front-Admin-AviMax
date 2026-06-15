import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Home, AlertTriangle, AlertOctagon, WifiOff, BellRing,
  Thermometer, Droplets, Wind, ArrowRight, PlusCircle, RefreshCw
} from 'lucide-react'
import { getDashboardGeneral } from '../api/dashboard'
import type { GalponDashboard } from '../types'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import StatusBadge from '../components/common/StatusBadge'

function KpiCard({ label, value, icon, colorClass }: {
  label: string; value: number | string; icon: React.ReactNode; colorClass: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function gatewayColor(estado: string): string {
  switch (estado) {
    case 'CONECTADO': return 'bg-green-500'
    case 'DESCONECTADO': return 'bg-red-500'
    case 'ERROR': return 'bg-red-500'
    default: return 'bg-slate-400'
  }
}

function galponCardBorder(estado: string, alertas: number): string {
  if (alertas > 0) return 'border-red-300'
  if (estado === 'ACTIVO') return 'border-slate-200'
  if (estado === 'MANTENIMIENTO') return 'border-yellow-300'
  return 'border-slate-200'
}

function GalponCard({ g }: { g: GalponDashboard }) {
  return (
    <div className={`bg-white rounded-xl border-2 ${galponCardBorder(g.estado, g.alertasActivas)} p-5 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{g.codigo}</span>
            <StatusBadge status={g.estado} size="sm" />
          </div>
          <h3 className="font-semibold text-slate-800">{g.nombre}</h3>
        </div>
        {g.alertasActivas > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
            {g.alertasActivas} alarmas
          </span>
        )}
      </div>

      {/* Gateway */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${gatewayColor(g.gatewayEstado)}`} />
        <span className="text-xs text-slate-500">
          Gateway: <span className="font-medium text-slate-700">{g.gatewayEstado === 'SIN_DATOS' ? 'Sin datos' : g.gatewayEstado}</span>
        </span>
      </div>

      {/* Lectura actual */}
      {g.lecturaActual ? (
        <div className="grid grid-cols-3 gap-2">
          {g.lecturaActual.temperatura !== undefined && (
            <div className="flex flex-col items-center bg-orange-50 rounded-lg p-2">
              <Thermometer size={14} className="text-orange-500 mb-1" />
              <span className="text-sm font-bold text-slate-700">{g.lecturaActual.temperatura.toFixed(1)}°</span>
              <span className="text-xs text-slate-400">Temp.</span>
            </div>
          )}
          {g.lecturaActual.humedad !== undefined && (
            <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2">
              <Droplets size={14} className="text-blue-500 mb-1" />
              <span className="text-sm font-bold text-slate-700">{g.lecturaActual.humedad.toFixed(0)}%</span>
              <span className="text-xs text-slate-400">Hum.</span>
            </div>
          )}
          {g.lecturaActual.amoniaco !== undefined && (
            <div className="flex flex-col items-center bg-purple-50 rounded-lg p-2">
              <Wind size={14} className="text-purple-500 mb-1" />
              <span className="text-sm font-bold text-slate-700">{g.lecturaActual.amoniaco.toFixed(1)}</span>
              <span className="text-xs text-slate-400">NH3</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Sin lecturas registradas</p>
      )}

      {/* Parvada */}
      {g.parvada ? (
        <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs">
          <p className="font-medium text-slate-700 truncate">{g.parvada.nombre}</p>
          <div className="flex gap-3 mt-1 text-slate-500">
            <span>Día {g.parvada.dia}</span>
            <span>{g.parvada.avesActuales.toLocaleString()} aves</span>
            <span>Mort. hoy: {g.parvada.mortalidadHoy}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Sin parvada activa</p>
      )}

      {/* Actuadores */}
      <div className="flex gap-3 text-xs text-slate-500">
        <span>Ext: <b className="text-slate-700">{g.actuadoresActivos.extractoresOn}</b></span>
        <span>Cri: <b className="text-slate-700">{g.actuadoresActivos.criadorasOn}</b></span>
        <span>Bom: <b className="text-slate-700">{g.actuadoresActivos.bombasOn}</b></span>
      </div>

      {/* Action */}
      <Link
        to={`/galpones/${g.galponId}`}
        className="mt-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        Ver detalle <ArrowRight size={14} />
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardGeneral,
    refetchInterval: 30_000,
  })

  if (isLoading) return <LoadingState message="Cargando dashboard..." />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />

  const d = data!

  const lastUpdate = d.ultimaActualizacion
    ? new Date(d.ultimaActualizacion).toLocaleString('es-MX')
    : '—'

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Última actualización: {lastUpdate}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <Link
            to="/galpones/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            <PlusCircle size={16} />
            Nuevo galpón
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          label="Total galpones"
          value={d.totalGalpones}
          icon={<Home size={20} className="text-slate-600" />}
          colorClass="bg-slate-100"
        />
        <KpiCard
          label="Normales"
          value={d.galponesNormales}
          icon={<Home size={20} className="text-green-600" />}
          colorClass="bg-green-100"
        />
        <KpiCard
          label="Advertencia"
          value={d.galponesAdvertencia}
          icon={<AlertTriangle size={20} className="text-yellow-600" />}
          colorClass="bg-yellow-100"
        />
        <KpiCard
          label="Críticos"
          value={d.galponesCriticos}
          icon={<AlertOctagon size={20} className="text-red-600" />}
          colorClass="bg-red-100"
        />
        <KpiCard
          label="Gateways offline"
          value={d.gatewaysOffline}
          icon={<WifiOff size={20} className="text-slate-500" />}
          colorClass="bg-slate-100"
        />
        <KpiCard
          label="Alertas críticas"
          value={d.alertasCriticas}
          icon={<BellRing size={20} className="text-red-600" />}
          colorClass="bg-red-100"
        />
      </div>

      {/* Galpon grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Galpones</h2>
        {d.galpones.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-400 text-sm mb-4">No hay galpones registrados aún.</p>
            <Link
              to="/galpones/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
            >
              <PlusCircle size={16} />
              Crear primer galpón
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {d.galpones.map((g) => (
              <GalponCard key={g.galponId} g={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
