import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { getAlarms, getAlarmsHistory } from '../api/alarms'
import AlarmTable from '../components/alarms/AlarmTable'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'

type ATab = 'activas' | 'historial'

// ── Tab: Activas ──────────────────────────────────────────────────────────────

function TabActivas({ galponId }: { galponId: number }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['alarmas-galpon', String(galponId)],
    queryFn: () => getAlarms({ galpon_id: galponId }),
    refetchInterval: 30_000,
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
          message="No hay alarmas activas para este galpón."
          icon={<BellRing size={32} className="text-green-400" />}
        />
       ) : (
        <AlarmTable
          alarms={data}
          showActions
          onAction={() => refetch()}
        />
       )}
    </div>
  )
}

// ── Tab: Historial ────────────────────────────────────────────────────────────

function TabHistorial({ galponId }: { galponId: number }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['alarmas-historial-galpon', String(galponId)],
    queryFn: () => getAlarmsHistory({ galpon_id: galponId }),
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
        <AlarmTable alarms={data} />
       )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS: { key: ATab; label: string }[] = [
  { key: 'activas',   label: 'Activas' },
  { key: 'historial', label: 'Historial' },
]

export default function GalponAlarms() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const [tab, setTab] = useState<ATab>('activas')

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Alarmas del galpón</h2>
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

      {tab === 'activas'   && <TabActivas   galponId={galponId} />}
      {tab === 'historial' && <TabHistorial galponId={galponId} />}
    </div>
  )
}
