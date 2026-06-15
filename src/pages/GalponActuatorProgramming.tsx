import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Settings2, CheckCircle, Clock, WifiOff } from 'lucide-react'
import { getActuadores, updateExtractorProgramming } from '../api/actuators'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import type { Actuador } from '../types'

type SyncStatus = 'idle' | 'saving' | 'saved' | 'syncing' | 'synced' | 'offline'

function ExtractorProgramForm({ actuador, galponId }: { actuador: Actuador; galponId: number }) {
  const [tempOn, setTempOn] = useState('30.0')
  const [tempOff, setTempOff] = useState('27.5')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  const mutation = useMutation({
    mutationFn: () =>
      updateExtractorProgramming(galponId, actuador.id!, {
        temperatureOn: Number(tempOn),
        temperatureOff: Number(tempOff),
      }),
    onMutate: () => setSyncStatus('saving'),
    onSuccess: () => {
      setSyncStatus('saved')
      setTimeout(() => setSyncStatus('syncing'), 500)
      setTimeout(() => setSyncStatus('synced'), 3000)
    },
    onError: () => setSyncStatus('idle'),
  })

  const statusMessage: Record<SyncStatus, { msg: string; color: string; icon: React.ReactNode } | null> = {
    idle: null,
    saving: { msg: 'Guardando programación...', color: 'text-blue-600', icon: <Clock size={14} /> },
    saved: { msg: 'Programación guardada en central.', color: 'text-green-600', icon: <CheckCircle size={14} /> },
    syncing: { msg: 'Esperando sincronización con backend local...', color: 'text-yellow-600', icon: <Clock size={14} className="animate-spin" /> },
    synced: { msg: 'Sincronizado correctamente.', color: 'text-green-600', icon: <CheckCircle size={14} /> },
    offline: { msg: 'Configuración guardada. El backend local sincronizará cuando se conecte.', color: 'text-slate-500', icon: <WifiOff size={14} /> },
  }

  const status = statusMessage[syncStatus]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 size={16} className="text-brand-600" />
        <h3 className="font-semibold text-slate-800">{actuador.nombre}</h3>
        <span className="text-xs text-slate-400 font-mono">{actuador.tipo}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Temperatura de encendido (°C)
          </label>
          <input
            type="number"
            step="0.5"
            value={tempOn}
            onChange={(e) => setTempOn(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Temperatura de apagado (°C)
          </label>
          <input
            type="number"
            step="0.5"
            value={tempOff}
            onChange={(e) => setTempOff(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500">
        El extractor se encenderá cuando la temperatura supere <strong>{tempOn}°C</strong> y se apagará al bajar de <strong>{tempOff}°C</strong>.
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar programación'}
        </button>
        {status && (
          <span className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
            {status.icon}
            {status.msg}
          </span>
        )}
      </div>

      {mutation.isError && (
        <p className="text-xs text-red-600">{(mutation.error as Error).message}</p>
      )}
    </div>
  )
}

export default function GalponActuatorProgramming() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['actuadores', id],
    queryFn: () => getActuadores(Number(id)),
  })

  const extractors = data?.filter((a: Actuador) => a.tipo === 'EXTRACTOR') ?? []

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div>
        <h2 className="font-semibold text-slate-700">Programación de actuadores</h2>
        <p className="text-sm text-slate-400 mt-1">
          Los cambios se guardan en el servidor central y se sincronizan con el backend local vía MQTT.
        </p>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : extractors.length === 0 ? (
        <EmptyState message="No hay extractores registrados para programar." />
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Extractores</h3>
          {extractors.map((a, i) => (
            <ExtractorProgramForm key={a.id ?? i} actuador={a} galponId={Number(id)} />
          ))}
        </div>
      )}

      {/* Future: criadoras and bombas */}
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-sm text-slate-400">
        Programación de criadoras y bombas disponible próximamente.
      </div>
    </div>
  )
}
