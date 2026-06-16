import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Server, Wifi, WifiOff, Radio, PlusCircle, Pencil, X } from 'lucide-react'
import { getGateways } from '../api/galpones'
import { createGateway, updateGateway } from '../api/gateways'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'
import type { GatewayDto, GatewayEstado } from '../types'

const estadoIcon: Record<GatewayEstado, React.ReactNode> = {
  ONLINE:    <Wifi size={20} className="text-green-500" />,
  OFFLINE:   <WifiOff size={20} className="text-red-500" />,
  SIN_DATOS: <Radio size={20} className="text-slate-400" />,
}

const estadoBorder: Record<GatewayEstado, string> = {
  ONLINE:    'border-green-200',
  OFFLINE:   'border-red-200',
  SIN_DATOS: 'border-slate-200',
}

const estadoBadge: Record<GatewayEstado, string> = {
  ONLINE:    'bg-green-100 text-green-700',
  OFFLINE:   'bg-red-100 text-red-700',
  SIN_DATOS: 'bg-slate-100 text-slate-500',
}

const estadoMsg: Record<GatewayEstado, string> = {
  ONLINE:    'Conectado y enviando datos.',
  OFFLINE:   'Desconectado del broker MQTT.',
  SIN_DATOS: 'Aún no ha reportado conexión.',
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

interface GatewayFormState {
  gatewayCode: string
  nombre: string
  tipo: string
  ipAddress: string
  estado: GatewayEstado
}

const emptyForm = (): GatewayFormState => ({
  gatewayCode: '',
  nombre: '',
  tipo: 'RASPI5',
  ipAddress: '',
  estado: 'SIN_DATOS',
})

function GatewayForm({
  galponId,
  initial,
  gatewayId,
  onDone,
  onCancel,
}: {
  galponId: number
  initial: GatewayFormState
  gatewayId?: number
  onDone: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<GatewayFormState>(initial)
  const set = <K extends keyof GatewayFormState>(k: K, v: GatewayFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const isEdit = gatewayId !== undefined

  const createMut = useMutation({
    mutationFn: () =>
      createGateway({
        galponId,
        gatewayCode: form.gatewayCode,
        nombre: form.nombre,
        tipo: form.tipo || undefined,
        ipAddress: form.ipAddress || undefined,
        estado: form.estado,
      }),
    onSuccess: onDone,
  })

  const updateMut = useMutation({
    mutationFn: () =>
      updateGateway(gatewayId!, {
        galponId,
        gatewayCode: form.gatewayCode,
        nombre: form.nombre,
        tipo: form.tipo || undefined,
        ipAddress: form.ipAddress || undefined,
        estado: form.estado,
      }),
    onSuccess: onDone,
  })

  const mut = isEdit ? updateMut : createMut
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mut.mutate() }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">
          {isEdit ? 'Editar gateway' : 'Registrar gateway'}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Código *</label>
          <input
            className={inputClass}
            value={form.gatewayCode}
            onChange={(e) => set('gatewayCode', e.target.value)}
            placeholder="raspi5-galpon-01"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
          <input
            className={inputClass}
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Raspberry Pi Galpón 1"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
          <input
            className={inputClass}
            value={form.tipo}
            onChange={(e) => set('tipo', e.target.value)}
            placeholder="RASPI5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">IP Address</label>
          <input
            className={inputClass}
            value={form.ipAddress}
            onChange={(e) => set('ipAddress', e.target.value)}
            placeholder="192.168.1.100"
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
            <select
              className={inputClass}
              value={form.estado}
              onChange={(e) => set('estado', e.target.value as GatewayEstado)}
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="SIN_DATOS">Sin datos</option>
            </select>
          </div>
        )}
      </div>

      {mut.isError && (
        <p className="text-xs text-red-600">{(mut.error as Error).message}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={mut.isPending}
          className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {mut.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}

function GatewayCard({
  gw,
  onEdit,
}: {
  gw: GatewayDto
  onEdit: (gw: GatewayDto) => void
}) {
  return (
    <div className={`bg-white rounded-xl border-2 p-5 space-y-4 ${estadoBorder[gw.estado]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {estadoIcon[gw.estado]}
          <div>
            <p className="font-semibold text-slate-800">{gw.nombre}</p>
            <p className="text-xs font-mono text-slate-400">{gw.gatewayCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoBadge[gw.estado]}`}>
            {gw.estado}
          </span>
          <button
            onClick={() => onEdit(gw)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">{estadoMsg[gw.estado]}</p>

      <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-500">
        {gw.tipo && (
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Tipo</span>
            <span>{gw.tipo}</span>
          </div>
        )}
        {gw.ipAddress && (
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">IP</span>
            <span className="font-mono">{gw.ipAddress}</span>
          </div>
        )}
        {gw.ultimaConexion ? (
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Última conexión</span>
            <span>{new Date(gw.ultimaConexion).toLocaleString('es-MX')}</span>
          </div>
        ) : (
          <p className="italic text-slate-400">Sin registro de conexión</p>
        )}
      </div>
    </div>
  )
}

type FormMode = 'create' | { editing: GatewayDto } | null

export default function GalponGateways() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const qc = useQueryClient()

  const [mode, setMode] = useState<FormMode>(null)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['gateways', id],
    queryFn: () => getGateways(galponId),
  })

  const handleDone = () => {
    setMode(null)
    qc.invalidateQueries({ queryKey: ['gateways', id] })
  }

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Gateways del galpón</h2>
        <div className="flex gap-2">
          <RefreshButton onClick={() => refetch()} loading={isFetching} />
          {mode === null && (
            <button
              onClick={() => setMode('create')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
            >
              <PlusCircle size={15} /> Registrar gateway
            </button>
          )}
        </div>
      </div>

      {mode === 'create' && (
        <GatewayForm
          galponId={galponId}
          initial={emptyForm()}
          onDone={handleDone}
          onCancel={() => setMode(null)}
        />
      )}

      {typeof mode === 'object' && mode !== null && 'editing' in mode && (
        <GatewayForm
          galponId={galponId}
          gatewayId={mode.editing.id}
          initial={{
            gatewayCode: mode.editing.gatewayCode,
            nombre:      mode.editing.nombre,
            tipo:        mode.editing.tipo ?? '',
            ipAddress:   mode.editing.ipAddress ?? '',
            estado:      mode.editing.estado,
          }}
          onDone={handleDone}
          onCancel={() => setMode(null)}
        />
      )}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay gateways registrados para este galpón." icon={<Server size={32} />} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((gw) => (
            <GatewayCard
              key={gw.id}
              gw={gw}
              onEdit={(g) => setMode({ editing: g })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
