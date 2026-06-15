import { RefreshCw } from 'lucide-react'

interface Props {
  onClick: () => void
  loading?: boolean
  className?: string
}

export default function RefreshButton({ onClick, loading, className = '' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
    >
      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
      Actualizar
    </button>
  )
}
