import { apiClient } from './client'
import type { CreateSensorBody, SensorDto, UpdateSensorBody } from '../types'

export const createSensor = async (body: CreateSensorBody): Promise<SensorDto> => {
  const { data } = await apiClient.post<SensorDto>('/sensores', body)
  return data
}

export const updateSensor = async (id: number, body: UpdateSensorBody): Promise<SensorDto> => {
  const { data } = await apiClient.put<SensorDto>(`/sensores/${id}`, body)
  return data
}

export const getSensoresByGateway = async (gatewayId: number): Promise<SensorDto[]> => {
  const { data } = await apiClient.get<SensorDto[]>(`/gateways/${gatewayId}/sensores`)
  return data
}
