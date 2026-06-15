import type { GalponEstado, GatewayEstado, AlertaSeveridad, SyncEstado, AlertaEstado } from '../../types'

type Status = GalponEstado | GatewayEstado | AlertaSeveridad | SyncEstado | AlertaEstado | string

const statusMap: Record<string, { label: string; classes: string }> = {
  // Galpón
  ACTIVO:        { label: 'Activo',         classes: 'bg-green-100 text-green-800' },
  INACTIVO:      { label: 'Inactivo',       classes: 'bg-slate-100 text-slate-600' },
  MANTENIMIENTO: { label: 'Mantenimiento',  classes: 'bg-yellow-100 text-yellow-800' },
  SIN_DATOS:     { label: 'Sin datos',      classes: 'bg-slate-100 text-slate-500' },
  // Gateway
  CONECTADO:     { label: 'Conectado',      classes: 'bg-green-100 text-green-800' },
  DESCONECTADO:  { label: 'Desconectado',   classes: 'bg-red-100 text-red-700' },
  ERROR:         { label: 'Error',          classes: 'bg-red-100 text-red-700' },
  // Severidad
  NORMAL:        { label: 'Normal',         classes: 'bg-green-100 text-green-800' },
  ADVERTENCIA:   { label: 'Advertencia',    classes: 'bg-yellow-100 text-yellow-800' },
  CRITICA:       { label: 'Crítica',        classes: 'bg-red-100 text-red-700' },
  // Alarm state
  ACTIVA:        { label: 'Activa',         classes: 'bg-red-100 text-red-700' },
  RECONOCIDA:    { label: 'Reconocida',     classes: 'bg-yellow-100 text-yellow-800' },
  CERRADA:       { label: 'Cerrada',        classes: 'bg-slate-100 text-slate-500' },
  // Sync
  SINCRONIZADO:  { label: 'Sincronizado',   classes: 'bg-green-100 text-green-800' },
  PENDIENTE:     { label: 'Pendiente',      classes: 'bg-yellow-100 text-yellow-800' },
  REINTENTANDO:  { label: 'Reintentando',   classes: 'bg-orange-100 text-orange-700' },
  LOCAL_OFFLINE: { label: 'Local offline',  classes: 'bg-slate-100 text-slate-500' },
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = statusMap[status] ?? { label: status, classes: 'bg-slate-100 text-slate-600' }
  const sz = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sz} ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
