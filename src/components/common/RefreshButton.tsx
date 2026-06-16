import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  onClick: () => void
  loading?: boolean
  status?: 'ok' | 'error' | null
  className?: string
}

export default function RefreshButton({ onClick, loading, status, className = '' }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        Actualizar
      </button>
      {status === 'ok' && (
        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
          <CheckCircle size={14} />
          Actualizado
        </span>
      )}
      {status === 'error' && (
        <span className="inline-flex items-center gap-1 text-red-500 text-sm font-medium">
          <AlertCircle size={14} />
          Error al actualizar
        </span>
      )}
    </div>
  )
}
