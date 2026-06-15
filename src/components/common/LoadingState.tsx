import { Loader2 } from 'lucide-react'

interface Props {
  message?: string
}

export default function LoadingState({ message = 'Cargando...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <Loader2 size={32} className="animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
