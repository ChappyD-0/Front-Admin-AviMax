import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Settings2, CheckCircle, Clock, WifiOff, AlertCircle,
  ChevronDown, ChevronUp, Plus, X, History,
} from 'lucide-react'
import {
  getActuadores,
  getCriadoras, createCriadora, getCriadoraHistory,
  getBombas, createBomba, getBombaHistory,
  setUnifiedProgramming,
} from '../api/actuators'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import type {
  Actuador, CriadoraDto, BombaDto,
  UnifiedProgrammingResult, ProgrammingHistoryEntry,
  CreateCriadoraBody, CreateBombaBody,
} from '../types'

type PTab = 'extractores' | 'criadoras' | 'bombas'

// ── Sync status pill ─────────────────────────────────────────────────────────

const syncConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Pendiente',   color: 'text-yellow-600', icon: <Clock size={13} /> },
  SENT:     { label: 'Enviado',     color: 'text-blue-600',   icon: <Clock size={13} className="animate-spin" /> },
  APPLIED:  { label: 'Aplicado',    color: 'text-green-600',  icon: <CheckCircle size={13} /> },
  FAILED:   { label: 'Error envío', color: 'text-red-600',    icon: <AlertCircle size={13} /> },
  idle:     { label: '',            color: '',                 icon: null },
  saving:   { label: 'Guardando…',  color: 'text-slate-500',  icon: <Clock size={13} /> },
  offline:  { label: 'Sin gateway', color: 'text-slate-400',  icon: <WifiOff size={13} /> },
}

// ── History accordion ─────────────────────────────────────────────────────────

function HistoryAccordion({
  galponId, actuatorType, actuatorId,
}: {
  galponId: number
  actuatorType: 'criadora' | 'bomba'
  actuatorId: number
}) {
  const [open, setOpen] = useState(false)
  const fetchFn = actuatorType === 'criadora'
    ? () => getCriadoraHistory(galponId, actuatorId)
    : () => getBombaHistory(galponId, actuatorId)

  const { data, isLoading, isError, refetch } = useQuery<ProgrammingHistoryEntry[]>({
    queryKey: ['prog-history', actuatorType, actuatorId],
    queryFn: fetchFn,
    enabled: open,
  })

  return (
    <div className="border-t border-slate-100 pt-3">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) refetch() }}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
      >
        <History size={12} />
        Historial
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-3">
          {isLoading ? (
            <p className="text-xs text-slate-400">Cargando historial…</p>
          ) : isError ? (
            <p className="text-xs text-red-500">No se pudo cargar el historial.</p>
          ) : !data || data.length === 0 ? (
            <p className="text-xs text-slate-400">Sin registros de programación.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="pb-1 pr-3">Fecha</th>
                    <th className="pb-1 pr-3">Enc. (°C)</th>
                    <th className="pb-1 pr-3">Apag. (°C)</th>
                    {actuatorType === 'bomba' && <th className="pb-1 pr-3">Duración (s)</th>}
                    <th className="pb-1">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((h) => (
                    <tr key={h.id}>
                      <td className="py-1 pr-3 text-slate-400">
                        {new Date(h.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-1 pr-3 font-mono">{h.temperatureOn}</td>
                      <td className="py-1 pr-3 font-mono">{h.temperatureOff}</td>
                      {actuatorType === 'bomba' && (
                        <td className="py-1 pr-3 font-mono">{h.workDurationSeconds ?? '—'}</td>
                      )}
                      <td className="py-1">
                        {h.syncStatus ? (
                          <span className={`${(syncConfig[h.syncStatus] ?? syncConfig.idle).color} font-medium`}>
                            {(syncConfig[h.syncStatus] ?? syncConfig.idle).label || h.syncStatus}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Unified program form ──────────────────────────────────────────────────────

function UnifiedProgramForm({
  galponId, actuatorType, actuatorId, label, codeName, showWorkDuration,
}: {
  galponId: number
  actuatorType: 'extractor' | 'criadora' | 'bomba'
  actuatorId: number
  label: string
  codeName: string
  showWorkDuration?: boolean
}) {
  const [tempOn,   setTempOn]   = useState('30.0')
  const [tempOff,  setTempOff]  = useState('27.5')
  const [workSecs, setWorkSecs] = useState('60')
  const [result,   setResult]   = useState<UnifiedProgrammingResult | null>(null)
  const [saveErr,  setSaveErr]  = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      setUnifiedProgramming(galponId, actuatorType, actuatorId, {
        temperatureOn: Number(tempOn),
        temperatureOff: Number(tempOff),
        ...(showWorkDuration ? { workDurationSeconds: Number(workSecs) } : {}),
        dispatchNow: true,
      }),
    onSuccess: (data) => { setResult(data); setSaveErr(null) },
    onError: (e: Error) => { setSaveErr(e.message); setResult(null) },
  })

  const sync = result ? syncConfig[result.syncStatus] ?? syncConfig.idle : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 size={15} className="text-brand-600" />
        <p className="font-semibold text-slate-800">{label}</p>
        <span className="text-xs font-mono text-slate-400">{codeName}</span>
      </div>

      <div className={`grid gap-4 ${showWorkDuration ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Temp. encendido (°C)</label>
          <input
            type="number" step="0.5" value={tempOn}
            onChange={(e) => setTempOn(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Temp. apagado (°C)</label>
          <input
            type="number" step="0.5" value={tempOff}
            onChange={(e) => setTempOff(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {showWorkDuration && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Duración trabajo (s)</label>
            <input
              type="number" min="1" value={workSecs}
              onChange={(e) => setWorkSecs(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg px-4 py-2.5 text-xs text-slate-500">
        Se encenderá al superar <strong>{tempOn}°C</strong> y apagará al bajar de <strong>{tempOff}°C</strong>.
        {showWorkDuration && <> Duración activa: <strong>{workSecs}s</strong>.</>}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {mutation.isPending ? 'Guardando…' : 'Guardar y enviar vía MQTT'}
        </button>
        {mutation.isPending && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={13} /> Guardando…
          </span>
        )}
        {sync && !mutation.isPending && (
          <span className={`flex items-center gap-1.5 text-xs font-medium ${sync.color}`}>
            {sync.icon} {sync.label}
            {result?.sentAt && (
              <span className="text-slate-400 font-normal ml-1">
                · enviado {new Date(result.sentAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </span>
        )}
      </div>

      {saveErr && <p className="text-xs text-red-600">{saveErr}</p>}

      {(actuatorType === 'criadora' || actuatorType === 'bomba') && (
        <HistoryAccordion galponId={galponId} actuatorType={actuatorType} actuatorId={actuatorId} />
      )}
    </div>
  )
}

// ── Create actuador form ──────────────────────────────────────────────────────

function CreateActuadorForm({
  label, galponId, tipo, onDone,
}: {
  label: string
  galponId: number
  tipo: 'criadora' | 'bomba'
  onDone: () => void
}) {
  const qc = useQueryClient()
  const [name,     setName]     = useState('')
  const [codeName, setCodeName] = useState('')
  const [err,      setErr]      = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const body: CreateCriadoraBody | CreateBombaBody = { name, codeName }
      return tipo === 'criadora'
        ? createCriadora(galponId, body)
        : createBomba(galponId, body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tipo === 'criadora' ? 'criadoras' : 'bombas', String(galponId)] })
      onDone()
    },
    onError: (e: Error) => setErr(e.message),
  })

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-800">Nueva {label}</p>
        <button onClick={onDone} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder={`${label} Norte`}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Código</label>
          <input
            value={codeName} onChange={(e) => setCodeName(e.target.value)}
            placeholder={tipo === 'criadora' ? 'CRIA-01' : 'BOM-01'}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !name || !codeName}
        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
      >
        {mutation.isPending ? 'Creando…' : `Crear ${label}`}
      </button>
    </div>
  )
}

// ── Tab: Extractores ──────────────────────────────────────────────────────────

function TabExtractores({ galponId }: { galponId: number }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['actuadores', String(galponId)],
    queryFn: () => getActuadores(galponId),
  })

  const extractors = (data ?? []).filter((a: Actuador) => a.tipo === 'EXTRACTOR')

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
  if (extractors.length === 0)
    return <EmptyState message="No hay extractores registrados para programar." />

  return (
    <div className="space-y-4">
      {extractors.map((a, i) => (
        <UnifiedProgramForm
          key={a.id ?? i}
          galponId={galponId}
          actuatorType="extractor"
          actuatorId={a.id!}
          label={a.nombre}
          codeName={a.tipo}
        />
      ))}
    </div>
  )
}

// ── Tab: Criadoras ────────────────────────────────────────────────────────────

function TabCriadoras({ galponId }: { galponId: number }) {
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading, isError, error, refetch } = useQuery<CriadoraDto[]>({
    queryKey: ['criadoras', String(galponId)],
    queryFn: () => getCriadoras(galponId),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            <Plus size={14} /> Nueva criadora
          </button>
        )}
      </div>

      {showCreate && (
        <CreateActuadorForm
          label="criadora"
          galponId={galponId}
          tipo="criadora"
          onDone={() => setShowCreate(false)}
        />
      )}

      {isLoading ? <LoadingState /> :
       isError  ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> :
       !data || data.length === 0 ? (
        <EmptyState message="No hay criadoras registradas. Crea la primera usando el botón de arriba." />
       ) : (
        data.map((c) => (
          <UnifiedProgramForm
            key={c.id}
            galponId={galponId}
            actuatorType="criadora"
            actuatorId={c.id}
            label={c.name}
            codeName={c.codeName}
          />
        ))
       )}
    </div>
  )
}

// ── Tab: Bombas ───────────────────────────────────────────────────────────────

function TabBombas({ galponId }: { galponId: number }) {
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading, isError, error, refetch } = useQuery<BombaDto[]>({
    queryKey: ['bombas', String(galponId)],
    queryFn: () => getBombas(galponId),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            <Plus size={14} /> Nueva bomba
          </button>
        )}
      </div>

      {showCreate && (
        <CreateActuadorForm
          label="bomba"
          galponId={galponId}
          tipo="bomba"
          onDone={() => setShowCreate(false)}
        />
      )}

      {isLoading ? <LoadingState /> :
       isError  ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> :
       !data || data.length === 0 ? (
        <EmptyState message="No hay bombas registradas. Crea la primera usando el botón de arriba." />
       ) : (
        data.map((b) => (
          <UnifiedProgramForm
            key={b.id}
            galponId={galponId}
            actuatorType="bomba"
            actuatorId={b.id}
            label={b.name}
            codeName={b.codeName}
            showWorkDuration
          />
        ))
       )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const PTABS: { key: PTab; label: string }[] = [
  { key: 'extractores', label: 'Extractores' },
  { key: 'criadoras',   label: 'Criadoras' },
  { key: 'bombas',      label: 'Bombas' },
]

export default function GalponActuatorProgramming() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const [tab, setTab] = useState<PTab>('extractores')

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div>
        <h2 className="font-semibold text-slate-700">Programación de actuadores</h2>
        <p className="text-sm text-slate-400 mt-1">
          Los cambios se guardan y se envían al backend local vía MQTT con <code>dispatchNow</code>.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {PTABS.map((t) => (
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

      {tab === 'extractores' && <TabExtractores galponId={galponId} />}
      {tab === 'criadoras'   && <TabCriadoras   galponId={galponId} />}
      {tab === 'bombas'      && <TabBombas       galponId={galponId} />}
    </div>
  )
}
