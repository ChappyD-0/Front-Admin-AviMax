import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Trash2, ChevronRight } from 'lucide-react'
import { createGalpon } from '../api/provisioning'
import type { NuevoGalponForm, NuevoSensorForm, SensorTipo } from '../types'

const defaultSensors: NuevoSensorForm[] = [
  { codigo: 'TEMP-01', nombre: 'Temperatura principal', tipo: 'TEMPERATURA', unidad: '°C' },
  { codigo: 'HUM-01',  nombre: 'Humedad principal',     tipo: 'HUMEDAD',     unidad: '%' },
  { codigo: 'NH3-01',  nombre: 'Amoníaco principal',    tipo: 'AMONIACO',    unidad: 'ppm' },
]

const sensorTypes: { value: SensorTipo; label: string }[] = [
  { value: 'TEMPERATURA', label: 'Temperatura' },
  { value: 'HUMEDAD',     label: 'Humedad' },
  { value: 'AMONIACO',    label: 'Amoníaco' },
  { value: 'OTRO',        label: 'Otro' },
]

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

export default function GalponNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState<NuevoGalponForm>({
    galponCode: '',
    galponName: '',
    ubicacion: '',
    estado: 'ACTIVO',
    gatewayCode: '',
    gatewayName: '',
    mqttBrokerUrl: 'tcp://localhost:1883',
    gatewayDescription: '',
    sensors: [...defaultSensors],
    cantidadExtractores: 1,
    cantidadCriadoras: 1,
    cantidadBombas: 1,
    crearReglasDefault: true,
  })

  const mutation = useMutation({
    mutationFn: createGalpon,
    onSuccess: (data) => {
      navigate(`/galpones/${data.galponId}/provisioning`, { state: { created: true } })
    },
  })

  const setField = <K extends keyof NuevoGalponForm>(key: K, val: NuevoGalponForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const setSensor = (i: number, key: keyof NuevoSensorForm, val: string) =>
    setForm((f) => {
      const sensors = [...f.sensors]
      sensors[i] = { ...sensors[i], [key]: val }
      return { ...f, sensors }
    })

  const addSensor = () =>
    setForm((f) => ({
      ...f,
      sensors: [...f.sensors, { codigo: '', nombre: '', tipo: 'OTRO', unidad: '' }],
    }))

  const removeSensor = (i: number) =>
    setForm((f) => ({ ...f, sensors: f.sensors.filter((_, idx) => idx !== i) }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección: Datos del galpón */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 text-base">Datos del galpón</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código" hint="Ej: G-03">
              <input
                className={inputClass}
                value={form.galponCode}
                onChange={(e) => setField('galponCode', e.target.value)}
                placeholder="G-03"
                required
              />
            </Field>
            <Field label="Nombre">
              <input
                className={inputClass}
                value={form.galponName}
                onChange={(e) => setField('galponName', e.target.value)}
                placeholder="Galpón 3"
                required
              />
            </Field>
            <Field label="Ubicación (opcional)">
              <input
                className={inputClass}
                value={form.ubicacion}
                onChange={(e) => setField('ubicacion', e.target.value)}
                placeholder="Zona norte"
              />
            </Field>
            <Field label="Estado inicial">
              <select
                className={inputClass}
                value={form.estado}
                onChange={(e) => setField('estado', e.target.value as 'ACTIVO' | 'INACTIVO')}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Sección: Gateway local */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 text-base">Gateway local (Raspberry Pi)</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código del gateway" hint="Ej: raspi5-galpon-03">
              <input
                className={inputClass}
                value={form.gatewayCode}
                onChange={(e) => setField('gatewayCode', e.target.value)}
                placeholder="raspi5-galpon-03"
                required
              />
            </Field>
            <Field label="Nombre del gateway">
              <input
                className={inputClass}
                value={form.gatewayName}
                onChange={(e) => setField('gatewayName', e.target.value)}
                placeholder="Raspberry Pi Galpón 3"
                required
              />
            </Field>
            <Field label="URL del broker MQTT" hint="tcp://IP:1883">
              <input
                className={inputClass}
                value={form.mqttBrokerUrl}
                onChange={(e) => setField('mqttBrokerUrl', e.target.value)}
                placeholder="tcp://localhost:1883"
                required
              />
            </Field>
            <Field label="Descripción (opcional)">
              <input
                className={inputClass}
                value={form.gatewayDescription}
                onChange={(e) => setField('gatewayDescription', e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* Sección: Sensores */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-base">Sensores iniciales</h2>
            <button
              type="button"
              onClick={addSensor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-50 text-sm font-medium"
            >
              <PlusCircle size={14} /> Añadir sensor
            </button>
          </div>
          {form.sensors.map((s, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg relative">
              <input
                className={inputClass}
                placeholder="Código"
                value={s.codigo}
                onChange={(e) => setSensor(i, 'codigo', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Nombre"
                value={s.nombre}
                onChange={(e) => setSensor(i, 'nombre', e.target.value)}
              />
              <select
                className={inputClass}
                value={s.tipo}
                onChange={(e) => setSensor(i, 'tipo', e.target.value)}
              >
                {sensorTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Unidad"
                  value={s.unidad}
                  onChange={(e) => setSensor(i, 'unidad', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSensor(i)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Sección: Actuadores */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 text-base">Actuadores iniciales</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Cantidad de extractores">
              <input
                type="number" min={0} max={20}
                className={inputClass}
                value={form.cantidadExtractores}
                onChange={(e) => setField('cantidadExtractores', Number(e.target.value))}
              />
            </Field>
            <Field label="Cantidad de criadoras">
              <input
                type="number" min={0} max={20}
                className={inputClass}
                value={form.cantidadCriadoras}
                onChange={(e) => setField('cantidadCriadoras', Number(e.target.value))}
              />
            </Field>
            <Field label="Cantidad de bombas">
              <input
                type="number" min={0} max={20}
                className={inputClass}
                value={form.cantidadBombas}
                onChange={(e) => setField('cantidadBombas', Number(e.target.value))}
              />
            </Field>
          </div>
        </section>

        {/* Sección: Reglas */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.crearReglasDefault}
              onChange={(e) => setField('crearReglasDefault', e.target.checked)}
              className="w-4 h-4 accent-brand-600"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">Crear reglas de alarma por defecto</p>
              <p className="text-xs text-slate-400">Temperatura, humedad y amoníaco con umbrales estándar</p>
            </div>
          </label>
        </section>

        {/* Error */}
        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {(mutation.error as Error).message}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/galpones')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {mutation.isPending ? 'Creando...' : 'Crear galpón'}
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
