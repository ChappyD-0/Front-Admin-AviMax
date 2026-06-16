import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Cpu, PlusCircle, Pencil, X } from 'lucide-react'
import { getSensores, getGateways } from '../api/galpones'
import { createSensor, updateSensor } from '../api/sensores'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import GalponTabs from '../components/common/GalponTabs'
import RefreshButton from '../components/common/RefreshButton'
import type { SensorDto, SensorEstado, SensorTipo } from '../types'

const tipoLabel: Record<SensorTipo, string> = {
  TEMPERATURA: 'Temperatura',
  HUMEDAD:     'Humedad',
  AMONIACO:    'Amoníaco',
  OTRO:        'Otro',
}

const estadoBadge: Record<SensorEstado, string> = {
  ACTIVO:  'bg-green-100 text-green-700',
  INACTIVO:'bg-slate-100 text-slate-500',
  FALLA:   'bg-red-100 text-red-700',
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

interface SensorFormState {
  gatewayId: string
  codigo: string
  nombre: string
  tipo: SensorTipo
  ubicacion: string
  unidad: string
  rangoMin: string
  rangoMax: string
  calibracionOffset: string
  estado: SensorEstado
}

const emptyForm = (defaultGatewayId?: number): SensorFormState => ({
  gatewayId:         defaultGatewayId ? String(defaultGatewayId) : '',
  codigo:            '',
  nombre:            '',
  tipo:              'TEMPERATURA',
  ubicacion:         '',
  unidad:            '°C',
  rangoMin:          '',
  rangoMax:          '',
  calibracionOffset: '0',
  estado:            'ACTIVO',
})

const sensorToForm = (s: SensorDto): SensorFormState => ({
  gatewayId:         String(s.gatewayId),
  codigo:            s.codigo,
  nombre:            s.nombre,
  tipo:              s.tipo,
  ubicacion:         s.ubicacion ?? '',
  unidad:            s.unidad,
  rangoMin:          s.rangoMin != null ? String(s.rangoMin) : '',
  rangoMax:          s.rangoMax != null ? String(s.rangoMax) : '',
  calibracionOffset: String(s.calibracionOffset),
  estado:            s.estado,
})

function SensorForm({
  galponId,
  sensorId,
  initial,
  onDone,
  onCancel,
}: {
  galponId: number
  sensorId?: number
  initial: SensorFormState
  onDone: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<SensorFormState>(initial)
  const set = <K extends keyof SensorFormState>(k: K, v: SensorFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const isEdit = sensorId !== undefined

  const { data: gateways = [] } = useQuery({
    queryKey: ['gateways', String(galponId)],
    queryFn: () => getGateways(galponId),
  })

  const buildBody = () => ({
    gatewayId:         Number(form.gatewayId),
    codigo:            form.codigo,
    nombre:            form.nombre,
    tipo:              form.tipo,
    ubicacion:         form.ubicacion || undefined,
    unidad:            form.unidad,
    rangoMin:          form.rangoMin !== '' ? Number(form.rangoMin) : undefined,
    rangoMax:          form.rangoMax !== '' ? Number(form.rangoMax) : undefined,
    calibracionOffset: form.calibracionOffset !== '' ? Number(form.calibracionOffset) : 0,
    estado:            form.estado,
  })

  const createMut = useMutation({ mutationFn: () => createSensor(buildBody()), onSuccess: onDone })
  const updateMut = useMutation({ mutationFn: () => updateSensor(sensorId!, buildBody()), onSuccess: onDone })
  const mut = isEdit ? updateMut : createMut

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mut.mutate() }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-sm">
          {isEdit ? 'Editar sensor' : 'Añadir sensor'}
        </h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Gateway *</label>
          <select
            className={inputClass}
            value={form.gatewayId}
            onChange={(e) => set('gatewayId', e.target.value)}
            required
          >
            <option value="">Seleccionar gateway...</option>
            {gateways.map((gw) => (
              <option key={gw.id} value={gw.id}>{gw.nombre} ({gw.gatewayCode})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
          <select
            className={inputClass}
            value={form.tipo}
            onChange={(e) => {
              const t = e.target.value as SensorTipo
              const defaultUnit = t === 'TEMPERATURA' ? '°C' : t === 'HUMEDAD' ? '%' : t === 'AMONIACO' ? 'ppm' : ''
              setForm((f) => ({ ...f, tipo: t, unidad: defaultUnit || f.unidad }))
            }}
          >
            {(Object.keys(tipoLabel) as SensorTipo[]).map((t) => (
              <option key={t} value={t}>{tipoLabel[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Código *</label>
          <input
            className={inputClass}
            value={form.codigo}
            onChange={(e) => set('codigo', e.target.value)}
            placeholder="amb1_temp"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
          <input
            className={inputClass}
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Temperatura Ambiente 1"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Unidad</label>
          <input
            className={inputClass}
            value={form.unidad}
            onChange={(e) => set('unidad', e.target.value)}
            placeholder="°C"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Ubicación</label>
          <input
            className={inputClass}
            value={form.ubicacion}
            onChange={(e) => set('ubicacion', e.target.value)}
            placeholder="Centro galpón"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Rango mín.</label>
          <input
            type="number" step="any"
            className={inputClass}
            value={form.rangoMin}
            onChange={(e) => set('rangoMin', e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Rango máx.</label>
          <input
            type="number" step="any"
            className={inputClass}
            value={form.rangoMax}
            onChange={(e) => set('rangoMax', e.target.value)}
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Offset calibración</label>
          <input
            type="number" step="any"
            className={inputClass}
            value={form.calibracionOffset}
            onChange={(e) => set('calibracionOffset', e.target.value)}
            placeholder="0"
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
            <select
              className={inputClass}
              value={form.estado}
              onChange={(e) => set('estado', e.target.value as SensorEstado)}
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="FALLA">Falla</option>
            </select>
          </div>
        )}
      </div>

      {mut.isError && (
        <p className="text-xs text-red-600">{(mut.error as Error).message}</p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={mut.isPending}
          className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60">
          {mut.isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Añadir sensor'}
        </button>
      </div>
    </form>
  )
}

type FormMode = 'create' | { editing: SensorDto } | null

export default function GalponSensors() {
  const { id } = useParams<{ id: string }>()
  const galponId = Number(id)
  const qc = useQueryClient()
  const [mode, setMode] = useState<FormMode>(null)

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['sensores', id],
    queryFn: () => getSensores(galponId),
  })

  const { data: gateways = [] } = useQuery({
    queryKey: ['gateways', id],
    queryFn: () => getGateways(galponId),
  })

  const handleDone = () => {
    setMode(null)
    qc.invalidateQueries({ queryKey: ['sensores', id] })
  }

  const defaultGatewayId = gateways[0]?.id

  return (
    <div className="space-y-5">
      <GalponTabs id={id!} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">Sensores del galpón</h2>
        <div className="flex gap-2">
          <RefreshButton onClick={() => refetch()} loading={isFetching} />
          {mode === null && (
            <button
              onClick={() => setMode('create')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
            >
              <PlusCircle size={15} /> Añadir sensor
            </button>
          )}
        </div>
      </div>

      {mode === 'create' && (
        <SensorForm
          galponId={galponId}
          initial={emptyForm(defaultGatewayId)}
          onDone={handleDone}
          onCancel={() => setMode(null)}
        />
      )}

      {typeof mode === 'object' && mode !== null && 'editing' in mode && (
        <SensorForm
          galponId={galponId}
          sensorId={mode.editing.id}
          initial={sensorToForm(mode.editing)}
          onDone={handleDone}
          onCancel={() => setMode(null)}
        />
      )}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState message="No hay sensores registrados para este galpón." icon={<Cpu size={32} />} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Código</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Nombre</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Tipo</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Unidad</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Rango</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Ubicación</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Estado</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Última lectura</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{s.codigo}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{s.nombre}</td>
                  <td className="px-4 py-3 text-slate-500">{tipoLabel[s.tipo] ?? s.tipo}</td>
                  <td className="px-4 py-3 text-slate-500">{s.unidad}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {s.rangoMin != null && s.rangoMax != null
                      ? `${s.rangoMin} – ${s.rangoMax}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{s.ubicacion || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[s.estado]}`}>
                      {s.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {s.ultimaLectura ? new Date(s.ultimaLectura).toLocaleString('es-MX') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setMode({ editing: s })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
