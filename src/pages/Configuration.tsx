import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Server, CheckCircle, XCircle, Settings } from 'lucide-react'
import { getDashboardGeneral } from '../api/dashboard'

export default function Configuration() {
  const [apiUrl, setApiUrl] = useState(
    typeof window !== 'undefined'
      ? (import.meta.env.VITE_API_URL ?? '/api')
      : '/api'
  )
  const [refreshInterval, setRefreshInterval] = useState('30')

  const { data, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardGeneral,
    retry: false,
  })

  const apiOnline = !!data && !isError

  return (
    <div className="max-w-2xl space-y-6">
      {/* API Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Server size={16} />
          Conexión con el backend central
        </div>
        <div className="flex items-center gap-3">
          {apiOnline
            ? <><CheckCircle size={18} className="text-green-500" /><span className="text-sm text-green-700 font-medium">Backend en línea</span></>
            : <><XCircle size={18} className="text-red-500" /><span className="text-sm text-red-700 font-medium">Backend no disponible</span></>
          }
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">URL base del API</label>
          <input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Para aplicar, actualiza la variable <code className="bg-slate-100 px-1 rounded">VITE_API_URL</code> en el archivo <code className="bg-slate-100 px-1 rounded">.env</code> y reinicia el servidor.
          </p>
        </div>
      </div>

      {/* Display */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Settings size={16} />
          Preferencias de visualización
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Intervalo de actualización automática (segundos)
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="10">10 segundos</option>
            <option value="15">15 segundos</option>
            <option value="30">30 segundos</option>
            <option value="60">1 minuto</option>
            <option value="0">Desactivado</option>
          </select>
        </div>
      </div>

      {/* System info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Información del sistema</p>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Versión frontend', value: '0.1.0' },
            { label: 'Total galpones', value: data?.totalGalpones ?? '—' },
            { label: 'Gateways offline', value: data?.gatewaysOffline ?? '—' },
            { label: 'Alertas críticas', value: data?.alertasCriticas ?? '—' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-slate-600">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
