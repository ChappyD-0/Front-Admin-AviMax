import { useParams, useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Server, Terminal, Radio, Package, ArrowLeft } from 'lucide-react'
import { getProvisioningDetail } from '../api/provisioning'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import CopyButton from '../components/common/CopyButton'

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function CodeBlock({ content }: { content: string }) {
  return (
    <div className="relative">
      <pre className="bg-slate-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
        {content}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={content} label="Copiar" />
      </div>
    </div>
  )
}

export default function GalponProvisioning() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const justCreated = (location.state as { created?: boolean } | null)?.created

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['provisioning', id],
    queryFn: () => getProvisioningDetail(Number(id)),
  })

  if (isLoading) return <LoadingState message="Cargando provisioning..." />
  if (isError) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />

  const d = data!

  const envBlock = Object.entries(d.localEnvironment)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  const topicsContent = Object.entries(d.mqttTopics)
    .map(([k, v]) => `${k.padEnd(18)}: ${v}`)
    .join('\n')

  return (
    <div className="max-w-3xl space-y-5">
      {justCreated && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">¡Galpón creado exitosamente!</p>
            <p className="text-xs text-green-700 mt-0.5">
              Usa las variables de abajo para configurar el backend local en el Raspberry Pi.
            </p>
          </div>
        </div>
      )}

      {/* Header info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Galpón</p>
          <p className="font-semibold text-slate-800">{d.galponName}</p>
          <p className="text-xs font-mono text-slate-500">{d.galponCode}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Gateway</p>
          <p className="font-semibold text-slate-800">{d.gatewayCode}</p>
          <p className="text-xs text-slate-500">{d.mqttBrokerUrl}</p>
        </div>
      </div>

      {/* Variables de entorno */}
      <Section title="Variables de entorno (.env)" icon={<Server size={16} />}>
        <CodeBlock content={envBlock} />
        <p className="text-xs text-slate-400">
          Copia estas variables en el archivo <code className="bg-slate-100 px-1 rounded">.env</code> del backend local o pásalas directamente al comando de arranque.
        </p>
      </Section>

      {/* Comando de arranque */}
      <Section title="Comando de arranque" icon={<Terminal size={16} />}>
        <CodeBlock content={d.localRunCommand} />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800">
          <strong>Nota:</strong> Si el backend local no está conectado todavía, la configuración ya está guardada en el servidor central y se sincronizará cuando el gateway se conecte.
        </div>
      </Section>

      {/* MQTT Topics */}
      <Section title="Tópicos MQTT configurados" icon={<Radio size={16} />}>
        <div className="relative">
          <pre className="bg-slate-50 border border-slate-200 text-xs rounded-lg p-4 overflow-x-auto font-mono text-slate-700 leading-relaxed">
            {topicsContent}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={topicsContent} label="Copiar" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(d.mqttTopics).map(([key, topic]) => (
            <div key={key} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-500 capitalize mb-1">{key}</p>
              <p className="text-xs font-mono text-slate-700 break-all">{topic}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Recursos creados */}
      <Section title="Recursos creados" icon={<Package size={16} />}>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Sensores',       value: d.createdResources.sensors },
            { label: 'Extractores',    value: d.createdResources.extractors },
            { label: 'Criadoras',      value: d.createdResources.criadoras },
            { label: 'Bombas',         value: d.createdResources.bombas },
            { label: 'Reglas default', value: d.createdResources.defaultRules },
          ].map((r) => (
            <div key={r.label} className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-slate-800">{r.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{r.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          to={`/galpones/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        >
          Ver detalle del galpón
        </Link>
        <Link
          to="/galpones"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium"
        >
          <ArrowLeft size={14} /> Lista de galpones
        </Link>
      </div>
    </div>
  )
}
