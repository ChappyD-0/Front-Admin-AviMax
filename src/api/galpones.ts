import { apiClient } from './client'
import type { Gateway, LecturaLatest, Parvada, Regla, Sensor } from '../types'

export const getLecturaLatest = async (id: number): Promise<LecturaLatest> => {
  const { data } = await apiClient.get<LecturaLatest>(`/galpones/${id}/lecturas/latest`)
  return data
}

export const getSensores = async (id: number): Promise<Sensor[]> => {
  const { data } = await apiClient.get<Sensor[]>(`/galpones/${id}/sensores`)
  return data
}

export const getGateways = async (id: number): Promise<Gateway[]> => {
  const { data } = await apiClient.get<Gateway[]>(`/galpones/${id}/gateways`)
  return data
}

export const getParvada = async (id: number): Promise<Parvada> => {
  const { data } = await apiClient.get<Parvada>(`/galpones/${id}/parvada/activa`)
  return data
}

export const getReglas = async (id: number): Promise<Regla[]> => {
  const { data } = await apiClient.get<Regla[]>(`/galpones/${id}/reglas`)
  return data
}

export const updateRegla = async (galponId: number, reglaId: number, payload: Partial<Regla>): Promise<Regla> => {
  const { data } = await apiClient.put<Regla>(`/galpones/${galponId}/reglas/${reglaId}`, payload)
  return data
}
