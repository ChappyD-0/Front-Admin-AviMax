import { NavLink } from 'react-router-dom'

interface Tab {
  label: string
  to: string
  end?: boolean
}

interface Props {
  id: string
}

export default function GalponTabs({ id }: Props) {
  const tabs: Tab[] = [
    { label: 'Resumen', to: `/galpones/${id}`, end: true },
    { label: 'Lecturas', to: `/galpones/${id}/lecturas` },
    { label: 'Sensores', to: `/galpones/${id}/sensores` },
    { label: 'Gateways', to: `/galpones/${id}/gateways` },
    { label: 'Actuadores', to: `/galpones/${id}/actuadores` },
    { label: 'Alarmas', to: `/galpones/${id}/alarmas` },
    { label: 'Reglas', to: `/galpones/${id}/reglas` },
    { label: 'Parvada', to: `/galpones/${id}/parvada` },
    { label: 'Provisioning', to: `/galpones/${id}/provisioning` },
  ]

  return (
    <div className="border-b border-slate-200 mb-6">
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
