import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface Props {
  message?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({ message = 'No hay datos disponibles.', icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
      {icon ?? <Inbox size={32} />}
      <p className="text-sm text-center max-w-sm">{message}</p>
      {action}
    </div>
  )
}
