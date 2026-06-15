import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import GalponList from './pages/GalponList'
import GalponNew from './pages/GalponNew'
import GalponDetail from './pages/GalponDetail'
import GalponReadings from './pages/GalponReadings'
import GalponSensors from './pages/GalponSensors'
import GalponGateways from './pages/GalponGateways'
import GalponActuators from './pages/GalponActuators'
import GalponActuatorProgramming from './pages/GalponActuatorProgramming'
import GalponAlarms from './pages/GalponAlarms'
import GalponRules from './pages/GalponRules'
import GalponFlock from './pages/GalponFlock'
import GalponProvisioning from './pages/GalponProvisioning'
import Alarms from './pages/Alarms'
import Synchronization from './pages/Synchronization'
import Configuration from './pages/Configuration'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/galpones" element={<GalponList />} />
            <Route path="/galpones/nuevo" element={<GalponNew />} />
            <Route path="/galpones/:id" element={<GalponDetail />} />
            <Route path="/galpones/:id/lecturas" element={<GalponReadings />} />
            <Route path="/galpones/:id/sensores" element={<GalponSensors />} />
            <Route path="/galpones/:id/gateways" element={<GalponGateways />} />
            <Route path="/galpones/:id/actuadores" element={<GalponActuators />} />
            <Route path="/galpones/:id/actuadores/programacion" element={<GalponActuatorProgramming />} />
            <Route path="/galpones/:id/alarmas" element={<GalponAlarms />} />
            <Route path="/galpones/:id/reglas" element={<GalponRules />} />
            <Route path="/galpones/:id/parvada" element={<GalponFlock />} />
            <Route path="/galpones/:id/provisioning" element={<GalponProvisioning />} />

            <Route path="/alarmas" element={<Alarms />} />
            <Route path="/sincronizacion" element={<Synchronization />} />
            <Route path="/configuracion" element={<Configuration />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
