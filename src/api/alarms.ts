import { apiClient } from './client'
import type { Alarma } from '../types'

export const getActiveAlarms = async (): Promise<Alarma[]> => {
  const { data } = await apiClient.get<Alarma[]>('/alarms/active')
  return data
}

export const getAlarmsByGalpon = async (id: number): Promise<Alarma[]> => {
  const { data } = await apiClient.get<Alarma[]>(`/galpones/${id}/alarmas`)
  return data
}
