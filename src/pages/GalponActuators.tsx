import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Zap, ZapOff, Settings2, Play, AlertCircle, X, Send,
} from 'lucide-react'
import {
  getActuadores, getPendingCommands, sendActuadorCommand,
  evaluateLatest, dispatchCommand,
} from '../api/actuators'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'
import type { Actuador, ComandoPendiente, EvaluationResult } from '../types'

const tipoLabel: Record<string, string> = {
  EXTRACTOR: 'Extractor',
  CRIADORA: 'Criadora',
  BOMBA: 'Bomba',
}

const tipoColor: Record<string, string> = {
  EXTRACTOR: 'text-brand-600',
  CRIADORA:  'text-orange-500',
  BOMBA:     'text-blue-500',
}

// ── Actuador card ─────────────────────────────────────────────────────────────

function ActuadorCard({ a, galponId }: { a: Actuador; galponId: number }) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (action: 'ON' | 'OFF') => sendActuadorCommand(galponId, a.id!, action, a.tipo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['actuadores', String(galponId)] }),
  })

  return (
    <div className={`bg-white rounded-xl border-2 p-5 space-y-4 ${a.estado ? 'border-brand-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${a.estado ? 'bg-brand-50' : 'bg-slate-50'}`}>
            {a.estado
              ? <Zap size={18} className={tipoColor[a.tipo] ?? 'text-slate-500'} />
              : <ZapOff size={18} className="text-slate-400" />
            }
          </div>
          <div>
            <p className="font-semibold text-slate-800">{a.nombre}</p>
            <p className="text-xs text-slate-400">{tipoLabel[a.tipo] ?? a.tipo}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.estado ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {a.estado ? 'ON' : 'OFF'}
          </span>
          <span className="text-xs text-slate-400">{a.modo}</span>
        </div>
      </div>

      {a.ultimaActivacion && (
        <p className="text-xs text-slate-400">
          Última activación: {new Date(a.ultimaActivacion).toLocaleString('es-MX')}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate('ON')}
          disabled={mutation.isPending || a.estado}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Encender
        </button>
        <button
          onClick={() => mutation.mutate('OFF')}
          disabled={mutation.isPending || !a.estado}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          Apagar
        </button>
      </div>

      {mutation.isError && (
        <p className="text-xs text-red-600">{(mutation.error as Error).message}</p>
      )}
    </div>
  )
}

// ── Evaluation result panel ───────────────────────────────────────────────────

function EvaluationPanel({
  result, onClose,
}: {
  result: EvaluationResult
  onClose: () => void
}) {
  const commandColor = (cmd: 'ON' | 'OFF') =>
    cmd === 'ON' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-blue-800">Resultado de evaluación</p>
          <p className="text-xs text-blue-500 mt-0.5">
            {new Date(result.evaluatedAt).toLocaleString('es-MX')} ·{' '}
            Temp: {result.temperatureC?.toFixed(1) ?? '—'}°C ·{' '}
            Hum: {result.humidityPercent?.toFixed(0) ?? '—'}%
          </p>
        </div>
        <button onClick={onClose} className="text-blue-400 hover:text-blue-600">
          <X size={15} />
        </button>
      </div>

      {result.signals.length === 0 ? (
        <p className="text-sm text-blue-600">Sin señales generadas — los actuadores ya están en el estado correcto.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            {result.signals.length} señal{result.signals.length !== 1 ? 'es' : ''} generada{result.signals.length !== 1 ? 's' : ''}
          </p>
          {result.signals.map((s) => (
            <div key={s.commandId} className="flex items-center justify-between bg-white rounded-lg border border-blue-100 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{s.actuatorName}</p>
                <p className="text-xs text-slate-400">{s.reason}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${commandColor(s.command)}`}>
                {s.command}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Pending commands ──────────────────────────────────────────────────────────

function PendingCommandsSection({ galponId }: { galponId: number }) {
  const qc = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery<ComandoPendiente[]>({
    queryKey: ['pending-commands', String(galponId)],
    queryFn: () => getPendingCommands(galponId),
    refetchInterval: 30_000,
  })

  const dispatch = useMutation({
    mutationFn: (commandId: number) => dispatchCommand(commandId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-commands', String(galponId)] }),
  })

  if (isLoading) return null
  if (isError) return null
  if (!data || data.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Comandos pendientes
          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">{data.length}</span>
        </h3>
        <button
          onClick={() => refetch()}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Actualizar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {data.map((cmd) => (
          <div key={cmd.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{cmd.actuadorNombre}</p>
              <p className="text-xs text-slate-400">
                {cmd.tipo} · {cmd.estado} ·{' '}
                {new Date(cmd.creadoEn).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
            <button
              onClick={() => dispatch.mutate(cmd.id)}
              disabled={dispatch.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium disabled:opacity-50"
            >
              <Send size={12} /> Despachar
            </button>
          </div>
        ))}
      </div>

      {dispatch.isError && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={13} />
          {(dispatch.error as Error).message}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GalponActuators() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null)
  const [evalErr, setEvalErr] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['actuadores', id],
    queryFn: () => getActuadores(galponId),
    refetchInterval: 15_000,
  })

  const evalMutation = useMutation({
    mutationFn: () => evaluateLatest(galponId),
    onSuccess: (res) => { setEvalResult(res); setEvalErr(null) },
    onError: (e: Error) => { setEvalErr(e.message); setEvalResult(null) },
  })

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Actuadores del galpón</h2>
        <div className="flex gap-2">
          <RefreshButton onClick={() => refetch()} loading={isFetching} />
          <button
            onClick={() => evalMutation.mutate()}
            disabled={evalMutation.isPending}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-medium disabled:opacity-60"
          >
            <Play size={14} />
            {evalMutation.isPending ? 'Evaluando…' : 'Evaluar'}
          </button>
          <Link
            to={`/galpones/${id}/actuadores/programacion`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium"
          >
            <Settings2 size={14} /> Programación
          </Link>
        </div>
      </div>

      {evalErr && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} />
          {evalErr}
          <button onClick={() => setEvalErr(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={13} /></button>
        </div>
      )}

      {evalResult && (
        <EvaluationPanel result={evalResult} onClose={() => setEvalResult(null)} />
      )}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay actuadores registrados para este galpón." icon={<Zap size={32} />} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((a, i) => (
            <ActuadorCard key={a.id ?? i} a={a} galponId={galponId} />
          ))}
        </div>
      )}

      <PendingCommandsSection galponId={galponId} />
    </div>
  )
}
