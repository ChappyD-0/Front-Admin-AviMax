import { apiClient } from './client'
import type { PagedReadings, SensorReading } from '../types'

export interface LecturasParams {
  start?: string
  end?: string
  variable?: string
  gatewayId?: number
  sensorId?: number
  page?: number
  size?: number
  sort?: string
}

export const getLecturas = async (
  galponId: number,
  params: LecturasParams = {}
): Promise<PagedReadings> => {
  const { data } = await apiClient.get<PagedReadings>(
    `/galpones/${galponId}/lecturas`,
    { params: { size: 50, sort: 'recordedAt,desc', ...params } }
  )
  return data
}

export const getRecentReadings = async (galponId: number): Promise<SensorReading[]> => {
  const { data } = await apiClient.get<SensorReading[]>(
    `/galpones/${galponId}/lecturas/recent`
  )
  return data
}
