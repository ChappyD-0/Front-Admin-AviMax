import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  text: string
  label?: string
  className?: string
}

export default function CopyButton({ text, label = 'Copiar', className = '' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors
        ${copied
          ? 'border-green-400 text-green-700 bg-green-50'
          : 'border-slate-300 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-400'
        } ${className}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? '¡Copiado!' : label}
    </button>
  )
}
