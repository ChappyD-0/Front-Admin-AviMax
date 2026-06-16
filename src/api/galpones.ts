import { apiClient } from './client'
import type { CreateGalponBody, Galpon, GatewayDto, LecturaLatest, Parvada, Regla, SensorDto } from '../types'

export const getAllGalpones = async (): Promise<Galpon[]> => {
  const { data } = await apiClient.get<Galpon[]>('/galpones')
  return data
}

export const getGalpon = async (id: number): Promise<Galpon> => {
  const { data } = await apiClient.get<Galpon>(`/galpones/${id}`)
  return data
}

export const createGalponBasic = async (body: CreateGalponBody): Promise<Galpon> => {
  const { data } = await apiClient.post<Galpon>('/galpones', body)
  return data
}

export const getLecturaLatest = async (id: number): Promise<LecturaLatest> => {
  const { data } = await apiClient.get<LecturaLatest>(`/galpones/${id}/lecturas/latest`)
  return data
}

export const getSensores = async (id: number): Promise<SensorDto[]> => {
  const { data } = await apiClient.get<SensorDto[]>(`/galpones/${id}/sensores`)
  return data
}

export const getGateways = async (id: number): Promise<GatewayDto[]> => {
  const { data } = await apiClient.get<GatewayDto[]>(`/galpones/${id}/gateways`)
  return data
}

export const getParvada = async (id: number): Promise<Parvada> => {
  const { data } = await apiClient.get<Parvada>(`/galpones/${id}/flocks/active`)
  return data
}

export const getReglas = async (id: number): Promise<Regla[]> => {
  const { data } = await apiClient.get<Regla[]>('/alarms/rules', { params: { galponId: id } })
  return data
}

export const updateRegla = async (_galponId: number, reglaId: number, payload: Partial<Regla>): Promise<Regla> => {
  const { data } = await apiClient.put<Regla>(`/alarms/rules/${reglaId}`, payload)
  return data
}
