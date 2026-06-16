import { apiClient } from './client'
import type { CreateFlockBody, Flock } from '../types'

export const getFlocks = async (galponId: number): Promise<Flock[]> => {
  const { data } = await apiClient.get<Flock[]>(`/galpones/${galponId}/flocks`)
  return data
}

export const getActiveFlock = async (galponId: number): Promise<Flock> => {
  const { data } = await apiClient.get<Flock>(`/galpones/${galponId}/flocks/active`)
  return data
}

export const createFlock = async (galponId: number, body: CreateFlockBody): Promise<Flock> => {
  const { data } = await apiClient.post<Flock>(`/galpones/${galponId}/flocks`, body)
  return data
}

export const closeFlock = async (galponId: number, flockId: number): Promise<Flock> => {
  const { data } = await apiClient.post<Flock>(`/galpones/${galponId}/flocks/${flockId}/close`)
  return data
}
