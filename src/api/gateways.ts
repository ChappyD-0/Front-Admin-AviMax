import { apiClient } from './client'
import type { CreateGatewayBody, GatewayDto, UpdateGatewayBody } from '../types'

export const getAllGateways = async (): Promise<GatewayDto[]> => {
  const { data } = await apiClient.get<GatewayDto[]>('/gateways')
  return data
}

export const getGateway = async (id: number): Promise<GatewayDto> => {
  const { data } = await apiClient.get<GatewayDto>(`/gateways/${id}`)
  return data
}

export const createGateway = async (body: CreateGatewayBody): Promise<GatewayDto> => {
  const { data } = await apiClient.post<GatewayDto>('/gateways', body)
  return data
}

export const updateGateway = async (id: number, body: UpdateGatewayBody): Promise<GatewayDto> => {
  const { data } = await apiClient.put<GatewayDto>(`/gateways/${id}`, body)
  return data
}
