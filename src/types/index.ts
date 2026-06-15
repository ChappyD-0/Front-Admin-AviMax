// --- Enums ---

export type GalponEstado = 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' | 'SIN_DATOS'
export type GatewayEstado = 'CONECTADO' | 'DESCONECTADO' | 'SIN_DATOS' | 'ERROR'
export type AlertaSeveridad = 'NORMAL' | 'ADVERTENCIA' | 'CRITICA'
export type AlertaEstado = 'ACTIVA' | 'RECONOCIDA' | 'CERRADA'
export type SyncEstado = 'SINCRONIZADO' | 'PENDIENTE' | 'REINTENTANDO' | 'ERROR' | 'LOCAL_OFFLINE'
export type ActuadorTipo = 'EXTRACTOR' | 'CRIADORA' | 'BOMBA'
export type ActuadorModo = 'AUTOMATICO' | 'MANUAL'
export type SensorTipo = 'TEMPERATURA' | 'HUMEDAD' | 'AMONIACO' | 'OTRO'

// --- Dashboard ---

export interface ParvadaResumen {
  id: number
  nombre: string
  dia: number
  avesIniciales: number
  avesActuales: number
  mortalidadHoy: number
}

export interface ActuadoresActivos {
  extractoresOn: number
  criadorasOn: number
  bombasOn: number
}

export interface GalponDashboard {
  galponId: number
  codigo: string
  nombre: string
  estado: GalponEstado
  gatewayEstado: GatewayEstado
  ultimaLectura: string | null
  parvada: ParvadaResumen | null
  lecturaActual: LecturaActual | null
  alertasActivas: number
  actuadoresActivos: ActuadoresActivos
}

export interface LecturaActual {
  temperatura?: number
  humedad?: number
  amoniaco?: number
  timestamp?: string
}

export interface DashboardGeneral {
  totalGalpones: number
  galponesNormales: number
  galponesAdvertencia: number
  galponesCriticos: number
  gatewaysOffline: number
  alertasCriticas: number
  ultimaActualizacion: string
  galpones: GalponDashboard[]
}

// --- Galpones ---

export interface GalponListItem {
  galponId: number
  galponCode: string
  galponName: string
  gatewayCode: string
}

export interface Sensor {
  id?: number
  codigo: string
  nombre: string
  tipo: SensorTipo
  unidad: string
  estado?: string
  ultimaLectura?: string | null
}

export interface Gateway {
  id?: number
  codigo: string
  nombre: string
  estado: GatewayEstado
  ultimaConexion?: string | null
  mqttBrokerUrl?: string
  galponId?: number
}

export interface Actuador {
  id?: number
  nombre: string
  tipo: ActuadorTipo
  estado: boolean
  modo: ActuadorModo
  ultimaActivacion?: string | null
}

export interface LecturaLatest {
  galponId: number
  timestamp: string
  temperatura?: number
  humedad?: number
  amoniaco?: number
  sensorCodigo?: string
  gatewayCodigo?: string
}

// --- Provisioning ---

export interface MqttTopics {
  readings: string
  commands: string
  responses: string
  sync: string
  programming: string
  programmingAck: string
}

export interface CreatedResources {
  sensors: number
  extractors: number
  criadoras: number
  bombas: number
  defaultRules: number
}

export interface ProvisioningDetail {
  galponId: number
  galponCode: string
  galponName: string
  gatewayId: number
  gatewayCode: string
  mqttBrokerUrl: string
  localEnvironment: Record<string, string>
  localRunCommand: string
  mqttTopics: MqttTopics
  createdResources: CreatedResources
}

// --- Alarmas ---

export interface Alarma {
  id: number
  galponId: number
  galponNombre: string
  sensorCodigo: string
  variable: string
  valorDetectado: number
  reglaActivada: string
  severidad: AlertaSeveridad
  estado: AlertaEstado
  timestamp: string
}

// --- Reglas ---

export interface Regla {
  id: number
  nombre: string
  variableTipo: string
  umbralMinimo?: number
  umbralMaximo?: number
  severidad: AlertaSeveridad
  activa: boolean
  galponId: number
}

// --- Actuadores y Programacion ---

export interface ProgramacionExtractor {
  temperatureOn: number
  temperatureOff: number
}

export interface ProgramacionCriadora {
  temperatureOn: number
  temperatureOff: number
}

export interface ProgramacionBomba {
  intervaloMinutos: number
  duracionSegundos: number
}

export interface ComandoPendiente {
  id: number
  actuadorId: number
  actuadorNombre: string
  tipo: string
  payload: Record<string, unknown>
  estado: string
  creadoEn: string
}

// --- Parvada ---

export interface Parvada {
  id: number
  nombre: string
  fechaInicio: string
  diaActual: number
  avesIniciales: number
  avesActuales: number
  mortalidadAcumulada: number
  mortalidadHoy: number
  estado: string
}

// --- Sincronizacion ---

export interface SyncInfo {
  galponId: number
  galponNombre: string
  gatewayEstado: GatewayEstado
  ultimaConexion: string | null
  ultimoEventoSync: string | null
  programacionPendiente: number
  programacionSincronizada: number
  errores: number
  reintentos: number
  estado: SyncEstado
}

// --- Form types ---

export interface NuevoSensorForm {
  codigo: string
  nombre: string
  tipo: SensorTipo
  unidad: string
}

export interface NuevoGalponForm {
  galponCode: string
  galponName: string
  ubicacion?: string
  estado: 'ACTIVO' | 'INACTIVO'
  gatewayCode: string
  gatewayName: string
  mqttBrokerUrl: string
  gatewayDescription?: string
  sensors: NuevoSensorForm[]
  cantidadExtractores: number
  cantidadCriadoras: number
  cantidadBombas: number
  crearReglasDefault: boolean
}
