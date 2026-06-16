import { useState, Fragment } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, CheckCheck, X as CloseIcon } from 'lucide-react'
import { acknowledgeAlarm, closeAlarm, getAlarmEvents } from '../../api/alarms'
import StatusBadge from '../common/StatusBadge'
import type { Alarma, AlarmEvent } from '../../types'

// ── Event type config ─────────────────────────────────────────────────────────

const eventLabel: Record<string, string> = {
  CREATED:      'Creada',
  ACKNOWLEDGED: 'Reconocida',
  CLOSED:       'Cerrada',
  REOPENED:     'Reabierta',
  UPDATED:      'Actualizada',
}

const eventColor: Record<string, string> = {
  CREATED:      'bg-red-100 text-red-700',
  ACKNOWLEDGED: 'bg-yellow-100 text-yellow-700',
  CLOSED:       'bg-green-100 text-green-700',
  REOPENED:     'bg-orange-100 text-orange-700',
  UPDATED:      'bg-blue-100 text-blue-700',
}

// ── Events panel ──────────────────────────────────────────────────────────────

function EventsPanel({ alarmId }: { alarmId: number }) {
  const { data, isLoading, isError } = useQuery<AlarmEvent[]>({
    queryKey: ['alarm-events', alarmId],
    queryFn: () => getAlarmEvents(alarmId),
  })

  if (isLoading) return <p className="px-6 py-3 text-xs text-slate-400">Cargando eventos…</p>
  if (isError)   return <p className="px-6 py-3 text-xs text-red-500">Error al cargar eventos.</p>
  if (!data || data.length === 0)
    return <p className="px-6 py-3 text-xs text-slate-400">Sin eventos registrados.</p>

  return (
    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Historial de eventos</p>
      <div className="space-y-2">
        {data.map((ev) => (
          <div key={ev.id} className="flex items-start gap-3">
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${eventColor[ev.eventType] ?? 'bg-slate-100 text-slate-600'}`}>
              {eventLabel[ev.eventType] ?? ev.eventType}
            </span>
            <div className="min-w-0">
              {ev.description && <p className="text-xs text-slate-600 truncate">{ev.description}</p>}
              <p className="text-xs text-slate-400">
                {ev.performedBy ? `${ev.performedBy} · ` : ''}
                {new Date(ev.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Alarm table ───────────────────────────────────────────────────────────────

interface Props {
  alarms: Alarma[]
  showActions?: boolean
  showGalpon?: boolean
  onAction?: () => void
}

export default function AlarmTable({ alarms, showActions = false, showGalpon = false, onAction }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const ackMutation  = useMutation({ mutationFn: acknowledgeAlarm, onSuccess: () => onAction?.() })
  const closeMutation = useMutation({ mutationFn: closeAlarm,      onSuccess: () => onAction?.() })
  const isPending = ackMutation.isPending || closeMutation.isPending

  const colCount = 8 + (showGalpon ? 1 : 0) + (showActions ? 1 : 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-left whitespace-nowrap">
            <th className="px-3 py-3 w-8" />
            {showGalpon && <th className="px-4 py-3 font-semibold text-slate-600">Galpón</th>}
            <th className="px-4 py-3 font-semibold text-slate-600">Sensor</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Variable</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Valor</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Regla</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Severidad</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Estado</th>
            <th className="px-4 py-3 font-semibold text-slate-600">Fecha</th>
            {showActions && <th className="px-4 py-3 font-semibold text-slate-600">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {alarms.map((a) => (
            <Fragment key={a.id}>
              <tr
                className={`border-b border-slate-100 cursor-pointer transition-colors ${
                  a.severidad === 'CRITICA' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'
                }`}
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
              >
                <td className="px-3 py-3 text-slate-400">
                  {expandedId === a.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </td>
                {showGalpon && (
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{a.galponNombre}</td>
                )}
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.sensorCodigo}</td>
                <td className="px-4 py-3 text-slate-700">{a.variable}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{a.valorDetectado}</td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{a.reglaActivada}</td>
                <td className="px-4 py-3"><StatusBadge status={a.severidad} size="sm" /></td>
                <td className="px-4 py-3"><StatusBadge status={a.estado} size="sm" /></td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(a.timestamp).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                {showActions && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5 whitespace-nowrap">
                      {a.estado === 'ACTIVA' && (
                        <button
                          onClick={() => ackMutation.mutate(a.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-medium disabled:opacity-50"
                        >
                          <CheckCheck size={11} /> Reconocer
                        </button>
                      )}
                      {(a.estado === 'ACTIVA' || a.estado === 'RECONOCIDA') && (
                        <button
                          onClick={() => closeMutation.mutate(a.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium disabled:opacity-50"
                        >
                          <CloseIcon size={11} /> Cerrar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>

              {expandedId === a.id && (
                <tr>
                  <td colSpan={colCount} className="p-0">
                    <EventsPanel alarmId={a.id} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
