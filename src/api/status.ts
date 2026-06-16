import { apiClient } from './client'

export interface HealthStatus {
  status: string
  service: string
  timestamp: string
  database: string
}

export interface MqttStatus {
  connected: boolean
  brokerUrl: string
  clientId: string
  subscriptions: string[]
  lastMessageReceivedAt: string | null
  totalMessagesReceived: number
  lastError: string | null
  lastErrorAt: string | null
}

export const getHealth = async (): Promise<HealthStatus> => {
  const { data } = await apiClient.get<HealthStatus>('/status/health')
  return data
}

export const getMqttStatus = async (): Promise<MqttStatus> => {
  const { data } = await apiClient.get<MqttStatus>('/status/mqtt')
  return data
}
