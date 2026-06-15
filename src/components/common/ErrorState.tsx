import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = 'Ocurrió un error al cargar los datos.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-sm text-center max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} />
          Reintentar
        </button>
      )}
    </div>
  )
}
