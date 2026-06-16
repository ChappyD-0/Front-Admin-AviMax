// --- Enums ---

export type GalponEstado = 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' | 'SIN_DATOS'
export type GatewayEstado = 'ONLINE' | 'OFFLINE' | 'SIN_DATOS'
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

export type GalponEstadoCrud = 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO'

export interface Galpon {
  id: number
  codigo: string
  nombre: string
  ubicacion: string
  responsable: string
  capacidadAves: number
  estado: GalponEstadoCrud
  createdAt: string
  updatedAt: string
}

export interface CreateGalponBody {
  codigo: string
  nombre: string
  ubicacion?: string
  responsable?: string
  capacidadAves?: number
  estado: GalponEstadoCrud
}

export interface GalponListItem {
  galponId: number
  galponCode: string
  galponName: string
  gatewayCode: string
}

export type SensorEstado = 'ACTIVO' | 'INACTIVO' | 'FALLA'

export interface Sensor {
  id?: number
  codigo: string
  nombre: string
  tipo: SensorTipo
  unidad: string
  estado?: string
  ultimaLectura?: string | null
}

export interface SensorDto {
  id: number
  gatewayId: number
  codigo: string
  nombre: string
  tipo: SensorTipo
  ubicacion: string | null
  unidad: string
  rangoMin: number | null
  rangoMax: number | null
  calibracionOffset: number
  estado: SensorEstado
  ultimaLectura: string | null
  createdAt: string
}

export interface CreateSensorBody {
  gatewayId: number
  codigo: string
  nombre: string
  tipo: SensorTipo
  ubicacion?: string
  unidad: string
  rangoMin?: number
  rangoMax?: number
  calibracionOffset?: number
  estado?: SensorEstado
}

export interface UpdateSensorBody extends CreateSensorBody {
  estado: SensorEstado
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

export interface GatewayDto {
  id: number
  galponId: number
  gatewayCode: string
  nombre: string
  tipo: string
  ipAddress: string | null
  estado: GatewayEstado
  ultimaConexion: string | null
  createdAt: string
}

export interface CreateGatewayBody {
  galponId: number
  gatewayCode: string
  nombre: string
  tipo?: string
  ipAddress?: string
  estado?: GatewayEstado
}

export interface UpdateGatewayBody {
  galponId: number
  gatewayCode: string
  nombre: string
  tipo?: string
  ipAddress?: string
  estado?: GatewayEstado
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

export interface AlarmEvent {
  id: number
  alarmId: number
  eventType: string
  description: string | null
  performedBy: string | null
  createdAt: string
}

export interface CreateRuleBody {
  nombre: string
  variableTipo: string
  umbralMinimo?: number
  umbralMaximo?: number
  severidad: AlertaSeveridad
  galponId: number
  activa?: boolean
}

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

// --- Lecturas ---

export interface SensorReading {
  id: number
  galponId: number
  flockId: number | null
  gatewayId: number
  sensorId: number
  recordedAt: string
  sourceTopic: string
  temperatureC: number | null
  humidityPercent: number | null
  nh3Ppm: number | null
  createdAt: string
}

export interface PagedReadings {
  content: SensorReading[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// --- Flocks ---

export type FlockStatus = 'ACTIVE' | 'CLOSED'

export interface Flock {
  id: number
  galponId: number
  name: string
  totalBirds: number
  maleCount: number | null
  femaleCount: number | null
  birdLot: string | null
  status: FlockStatus
  flockDate: string
  startedAt: string
  endedAt: string | null
  notes: string | null
}

export interface CreateFlockBody {
  name: string
  totalBirds: number
  maleCount?: number
  femaleCount?: number
  birdLot?: string
  flockDate: string
  startedAt?: string
  notes?: string
}

// --- Registros productivos ---

export interface MortalityRecord {
  id: number
  galponId: number
  flockId: number
  recordDate: string
  ageDays: number
  maleCount: number
  femaleCount: number
  totalCount: number
  observations: string | null
  origin: string
  syncStatus: string
  createdAt: string
}

export type Gender = 'MALE' | 'FEMALE'

export interface WeightRecord {
  id: number
  galponId: number
  flockId: number
  sampledBirdsCount: number
  averageWeight: number
  ageDays: number
  recordDate: string
  gender: Gender | null
  location: string | null
  origin: string
  syncStatus: string
  createdAt: string
}

export interface ConsumptionRecord {
  id: number
  galponId: number
  flockId: number
  consumptionDate: string
  waterLiters: number | null
  foodKg: number | null
  origin: string
  syncStatus: string
  createdAt: string
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

// --- Criadoras / Bombas entities ---

export type ActuadorEstadoIoT = 'ON' | 'OFF'

export interface CriadoraDto {
  id: number
  galponId: number
  name: string
  codeName: string
  estado: ActuadorEstadoIoT
  createdAt: string
}

export interface CreateCriadoraBody {
  name: string
  codeName: string
  estado?: ActuadorEstadoIoT
}

export interface BombaDto {
  id: number
  galponId: number
  name: string
  codeName: string
  estado: ActuadorEstadoIoT
  createdAt: string
}

export interface CreateBombaBody {
  name: string
  codeName: string
  estado?: ActuadorEstadoIoT
}

// --- Unified MQTT programming ---

export interface UnifiedProgrammingBody {
  temperatureOn: number
  temperatureOff: number
  workDurationSeconds?: number
  dispatchNow?: boolean
}

export type ProgrammingSyncStatus = 'PENDING' | 'SENT' | 'APPLIED' | 'FAILED'

export interface UnifiedProgrammingResult {
  configId: number
  galponId: number
  gatewayId: number | null
  actuatorType: string
  actuatorId: number
  temperatureOn: number
  temperatureOff: number
  workDurationSeconds: number | null
  syncStatus: ProgrammingSyncStatus
  message: string
  createdAt: string
  sentAt: string | null
  appliedAt: string | null
}

export interface ProgrammingHistoryEntry {
  id: number
  temperatureOn: number
  temperatureOff: number
  workDurationSeconds?: number | null
  active?: boolean
  syncStatus?: string
  createdAt: string
  sentAt?: string | null
  appliedAt?: string | null
}

// --- Control evaluation ---

export interface EvaluationSignal {
  commandId: number
  actuatorType: string
  actuatorId: number
  actuatorName: string
  command: 'ON' | 'OFF'
  workDurationSeconds: number | null
  reason: string
  createdAt: string
}

export interface EvaluationResult {
  evaluatedAt: string
  galponId: number
  gatewayId: number | null
  temperatureC: number | null
  humidityPercent: number | null
  nh3Ppm: number | null
  counts: {
    extractorsTotal: number
    extractorsOn: number
    criadorasTotal: number
    criadorasOn: number
    bombasTotal: number
    bombasOn: number
  }
  signals: EvaluationSignal[]
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
