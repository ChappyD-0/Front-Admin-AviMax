import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { getActiveAlarms, getAlarmsHistory } from '../api/alarms'
import AlarmTable from '../components/alarms/AlarmTable'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import RefreshButton from '../components/common/RefreshButton'
import type { AlertaSeveridad } from '../types'

type ATab = 'activas' | 'historial'

// ── Tab: Activas ──────────────────────────────────────────────────────────────

function TabActivas() {
  const [filterSev, setFilterSev] = useState<AlertaSeveridad | 'ALL'>('ALL')

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['alarmas-activas'],
    queryFn: getActiveAlarms,
    refetchInterval: 30_000,
  })

  const filtered = (data ?? []).filter(
    (a) => filterSev === 'ALL' || a.severidad === filterSev
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['ALL', 'NORMAL', 'ADVERTENCIA', 'CRITICA'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterSev(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterSev === s
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s === 'ALL' ? 'Todas' : s === 'ADVERTENCIA' ? 'Advertencia' : s === 'CRITICA' ? 'Crítica' : 'Normal'}
            </button>
          ))}
        </div>
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      {isLoading ? <LoadingState /> :
       isError   ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> :
       filtered.length === 0 ? (
        <EmptyState
          message="No hay alarmas activas en este momento."
          icon={<BellRing size={32} className="text-green-400" />}
        />
       ) : (
        <AlarmTable
          alarms={filtered}
          showGalpon
          showActions
          onAction={() => refetch()}
        />
       )}
    </div>
  )
}

// ── Tab: Historial ────────────────────────────────────────────────────────────

function TabHistorial() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['alarmas-historial'],
    queryFn: () => getAlarmsHistory(),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RefreshButton onClick={() => refetch()} loading={isFetching} />
      </div>

      {isLoading ? <LoadingState /> :
       isError   ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> :
       !data || data.length === 0 ? (
        <EmptyState
          message="No hay alarmas en el historial."
          icon={<BellRing size={32} className="text-slate-300" />}
        />
       ) : (
        <AlarmTable alarms={data} showGalpon />
       )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS: { key: ATab; label: string }[] = [
  { key: 'activas',   label: 'Activas' },
  { key: 'historial', label: 'Historial' },
]

export default function Alarms() {
  const [tab, setTab] = useState<ATab>('activas')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Alarmas — todos los galpones</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'activas'   && <TabActivas />}
      {tab === 'historial' && <TabHistorial />}
    </div>
  )
}
