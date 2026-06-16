import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Thermometer, Droplets, Wind, Clock, Cpu,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { getLecturaLatest } from '../api/galpones'
import { getLecturas, getRecentReadings } from '../api/lecturas'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'

type Tab = 'actual' | 'recientes' | 'historial'

// ── Actual ──────────────────────────────────────────────────────────────────

function ReadingCard({ icon, label, value, unit, color }: {
  icon: React.ReactNode; label: string; value?: number | null; unit: string; color: string
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-6 flex flex-col gap-3">
      <div className={`p-3 rounded-lg w-fit ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {value != null ? (
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {value.toFixed(1)} <span className="text-base font-normal text-slate-400">{unit}</span>
          </p>
        ) : (
          <p className="text-2xl font-bold text-slate-400 mt-1">—</p>
        )}
      </div>
    </div>
  )
}

function TabActual({ galponId }: { galponId: number }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['lecturas-latest', String(galponId)],
    queryFn: () => getLecturaLatest(galponId),
    refetchInterval: 15_000,
    retry: false,
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">Lectura más reciente</h3>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>
      {isLoading ? <LoadingState message="Cargando lecturas..." /> :
       isError || !data ? (
        <EmptyState
          message="No se han recibido lecturas para este galpón todavía."
          icon={<Thermometer size={32} className="text-slate-300" />}
        />
       ) : (
        <>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {new Date(data.timestamp).toLocaleString('es-MX')}
            </span>
            {data.sensorCodigo && (
              <span className="flex items-center gap-1.5"><Cpu size={12} /> {data.sensorCodigo}</span>
            )}
            {data.gatewayCodigo && <span>Gateway: {data.gatewayCodigo}</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ReadingCard icon={<Thermometer size={22} className="text-orange-600" />} label="Temperatura" value={data.temperatura} unit="°C" color="bg-orange-50" />
            <ReadingCard icon={<Droplets size={22} className="text-blue-600" />} label="Humedad" value={data.humedad} unit="%" color="bg-blue-50" />
            <ReadingCard icon={<Wind size={22} className="text-purple-600" />} label="Amoníaco (NH₃)" value={data.amoniaco} unit="ppm" color="bg-purple-50" />
          </div>
          <p className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            Los datos se actualizan automáticamente cada 15 segundos.
          </p>
        </>
       )}
    </div>
  )
}

// ── Recientes 24h ────────────────────────────────────────────────────────────

function TabRecientes({ galponId }: { galponId: number }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['lecturas-recent', String(galponId)],
    queryFn: () => getRecentReadings(galponId),
    refetchInterval: 60_000,
  })

  const chartData = (data ?? [])
    .slice()
    .reverse()
    .map((r) => ({
      time: new Date(r.recordedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      temp: r.temperatureC,
      hum:  r.humidityPercent,
      nh3:  r.nh3Ppm,
    }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">Últimas 24 horas</h3>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>
      {isLoading ? <LoadingState /> :
       isError ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> :
       !data || data.length === 0 ? (
        <EmptyState message="Sin lecturas en las últimas 24 horas." icon={<Thermometer size={32} className="text-slate-300" />} />
       ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Temperatura (°C)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} unit="°C" width={40} />
                <Tooltip formatter={(v: number) => [`${v?.toFixed(1)} °C`, 'Temperatura']} />
                <Line type="monotone" dataKey="temp" stroke="#f97316" dot={false} strokeWidth={2} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Humedad (%) y NH₃ (ppm)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="hum"  name="Humedad %"  stroke="#3b82f6" dot={false} strokeWidth={2} connectNulls />
                <Line type="monotone" dataKey="nh3"  name="NH₃ ppm"   stroke="#a855f7" dot={false} strokeWidth={2} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400">{data.length} registros · actualiza cada minuto</p>
        </div>
       )}
    </div>
  )
}

// ── Historial paginado ────────────────────────────────────────────────────────

function TabHistorial({ galponId }: { galponId: number }) {
  const [page, setPage] = useState(0)
  const [start, setStart] = useState('')
  const [end,   setEnd]   = useState('')
  const [applied, setApplied] = useState<{ start?: string; end?: string }>({})

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lecturas-hist', String(galponId), page, applied],
    queryFn: () => getLecturas(galponId, { page, size: 50, start: applied.start, end: applied.end }),
  })

  const applyFilter = () => { setPage(0); setApplied({ start: start || undefined, end: end || undefined }) }
  const clearFilter = () => { setStart(''); setEnd(''); setPage(0); setApplied({}) }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <button onClick={applyFilter}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium">
          Aplicar
        </button>
        {(applied.start || applied.end) && (
          <button onClick={clearFilter}
            className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm">
            Limpiar
          </button>
        )}
      </div>

      {isLoading ? <LoadingState /> :
       isError ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> :
       !data || data.content.length === 0 ? (
        <EmptyState message="No hay lecturas para el rango seleccionado." icon={<Thermometer size={32} className="text-slate-300" />} />
       ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Fecha / Hora</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Temp (°C)</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Humedad (%)</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">NH₃ (ppm)</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Sensor</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Gateway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(r.recordedAt).toLocaleString('es-MX')}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.temperatureC?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.humidityPercent?.toFixed(0) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.nh3Ppm?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs font-mono">{r.sensorId}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs font-mono">{r.gatewayId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{data.totalElements.toLocaleString()} registros · página {data.page + 1} de {data.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40">
                <ChevronLeft size={14} /> Anterior
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages - 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40">
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
       )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function GalponReadings() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const [tab, setTab] = useState<Tab>('actual')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'actual',    label: 'Actual' },
    { key: 'recientes', label: 'Últimas 24h' },
    { key: 'historial', label: 'Historial' },
  ]

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'actual'    && <TabActual    galponId={galponId} />}
      {tab === 'recientes' && <TabRecientes galponId={galponId} />}
      {tab === 'historial' && <TabHistorial galponId={galponId} />}
    </div>
  )
}
