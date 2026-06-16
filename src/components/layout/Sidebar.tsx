import { NavLink, useParams } from 'react-router-dom'
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  Gauge,
  Cpu,
  Radio,
  BellRing,
  Settings2,
  Bird,
  RefreshCw,
  Settings,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive
      ? 'bg-brand-700 text-white'
      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
  }`

function GalponSubNav({ id }: { id: string }) {
  return (
    <div className="ml-4 border-l border-slate-700 pl-3 space-y-0.5">
      {[
        { to: `/galpones/${id}`, label: 'Resumen', end: true },
        { to: `/galpones/${id}/lecturas`, label: 'Lecturas' },
        { to: `/galpones/${id}/sensores`, label: 'Sensores' },
        { to: `/galpones/${id}/gateways`, label: 'Gateways' },
        { to: `/galpones/${id}/actuadores`, label: 'Actuadores' },
        { to: `/galpones/${id}/alarmas`, label: 'Alarmas' },
        { to: `/galpones/${id}/reglas`, label: 'Reglas' },
        { to: `/galpones/${id}/parvada`, label: 'Parvada' },
        { to: `/galpones/${id}/provisioning`, label: 'Provisioning' },
      ].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `block px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isActive
                ? 'text-brand-400 bg-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

export default function Sidebar() {
  const params = useParams()
  const galponId = params.id
  const [galponExpanded, setGalponExpanded] = useState(!!galponId)

  return (
    <aside className="w-80 bg-slate-900 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-700">
        <div className="bg-brand-600 p-2.5 rounded-lg">
          <Bird size={24} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-tight">AviMax</p>
          <p className="text-brand-400 text-sm font-medium">Central Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        {/* Galpones section */}
        <div>
          <button
            onClick={() => setGalponExpanded(!galponExpanded)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span className="flex-1 text-left">Galpones</span>
            <ChevronRight
              size={16}
              className={`transition-transform ${galponExpanded ? 'rotate-90' : ''}`}
            />
          </button>
          {galponExpanded && (
            <div className="mt-1 space-y-0.5 ml-4 border-l border-slate-700 pl-3">
              <NavLink
                to="/galpones"
                end
                className={({ isActive }) =>
                  `block px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-brand-400 bg-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`
                }
              >
                Lista de galpones
              </NavLink>
              <NavLink
                to="/galpones/nuevo"
                className={({ isActive }) =>
                  `block px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-brand-400 bg-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`
                }
              >
                + Nuevo galpón
              </NavLink>
              {galponId && galponId !== 'nuevo' && (
                <>
                  <p className="px-2 pt-2 pb-0.5 text-xs text-slate-500 uppercase tracking-wider">
                    Galpón #{galponId}
                  </p>
                  <GalponSubNav id={galponId} />
                </>
              )}
            </div>
          )}
        </div>

        <NavLink to="/alarmas" className={navLinkClass}>
          <BellRing size={20} />
          Alarmas
        </NavLink>

        <NavLink to="/sincronizacion" className={navLinkClass}>
          <RefreshCw size={20} />
          Sincronización
        </NavLink>

        <NavLink to="/configuracion" className={navLinkClass}>
          <Settings size={20} />
          Configuración
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-sm text-slate-500">v0.1.0 — Multi-House</p>
      </div>
    </aside>
  )
}
