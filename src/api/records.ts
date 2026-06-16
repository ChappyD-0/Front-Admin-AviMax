import { apiClient } from './client'
import type { ConsumptionRecord, Gender, MortalityRecord, WeightRecord } from '../types'

// ── Mortalidad ────────────────────────────────────────────────────────────────

export interface CreateMortalityBody {
  maleCount: number
  femaleCount: number
  observations?: string
}

export const getMortality = async (galponId: number): Promise<MortalityRecord[]> => {
  const { data } = await apiClient.get<MortalityRecord[]>(`/galpones/${galponId}/mortality`)
  return data
}

export const createMortality = async (
  galponId: number,
  body: CreateMortalityBody
): Promise<MortalityRecord> => {
  const { data } = await apiClient.post<MortalityRecord>(`/galpones/${galponId}/mortality`, body)
  return data
}

// ── Pesaje ────────────────────────────────────────────────────────────────────

export interface CreateWeightBody {
  flockId: number
  sampledBirdsCount: number
  averageWeight: number
  age?: number
  recordDate?: string
  gender?: Gender
  location?: string
}

/** GET /api/galpones/{id}/weight — todos los pesajes del galpón */
export const getWeight = async (galponId: number): Promise<WeightRecord[]> => {
  const { data } = await apiClient.get<WeightRecord[]>(`/galpones/${galponId}/weight`)
  return data
}

/** GET /api/galpones/{id}/weight/flock/{flockId} — pesajes de una parvada */
export const getWeightByFlock = async (
  galponId: number,
  flockId: number
): Promise<WeightRecord[]> => {
  const { data } = await apiClient.get<WeightRecord[]>(
    `/galpones/${galponId}/weight/flock/${flockId}`
  )
  return data
}

/** GET /api/galpones/{id}/weight/flock/{flockId}/gender/{gender} */
export const getWeightByFlockGender = async (
  galponId: number,
  flockId: number,
  gender: Gender
): Promise<WeightRecord[]> => {
  const { data } = await apiClient.get<WeightRecord[]>(
    `/galpones/${galponId}/weight/flock/${flockId}/gender/${gender}`
  )
  return data
}

/** GET /api/galpones/{id}/weight/flock/{flockId}/latest/gender/{gender} */
export const getLatestWeightByFlockGender = async (
  galponId: number,
  flockId: number,
  gender: Gender
): Promise<WeightRecord | null> => {
  const res = await apiClient.get<WeightRecord>(
    `/galpones/${galponId}/weight/flock/${flockId}/latest/gender/${gender}`
  )
  return res.status === 204 ? null : res.data
}

/** GET /api/galpones/{id}/weight/latest/male — último pesaje de machos (parvada activa) */
export const getLatestWeightMale = async (galponId: number): Promise<WeightRecord | null> => {
  const res = await apiClient.get<WeightRecord>(`/galpones/${galponId}/weight/latest/male`)
  return res.status === 204 ? null : res.data
}

/** GET /api/galpones/{id}/weight/latest/female — último pesaje de hembras (parvada activa) */
export const getLatestWeightFemale = async (galponId: number): Promise<WeightRecord | null> => {
  const res = await apiClient.get<WeightRecord>(`/galpones/${galponId}/weight/latest/female`)
  return res.status === 204 ? null : res.data
}

/** GET /api/galpones/{id}/weight/flock/{flockId}/range?from=&to= */
export const getWeightByFlockRange = async (
  galponId: number,
  flockId: number,
  from: string,
  to: string
): Promise<WeightRecord[]> => {
  const { data } = await apiClient.get<WeightRecord[]>(
    `/galpones/${galponId}/weight/flock/${flockId}/range`,
    { params: { from, to } }
  )
  return data
}

export const createWeight = async (
  galponId: number,
  body: CreateWeightBody
): Promise<WeightRecord> => {
  const { data } = await apiClient.post<WeightRecord>(`/galpones/${galponId}/weight`, body)
  return data
}

// ── Consumo ───────────────────────────────────────────────────────────────────

export interface CreateConsumptionBody {
  flockId: number
  consumptionDate: string
  waterLiters?: number
  foodKg?: number
}

export const getConsumption = async (galponId: number): Promise<ConsumptionRecord[]> => {
  const { data } = await apiClient.get<ConsumptionRecord[]>(`/galpones/${galponId}/consumption`)
  return data
}

export const createConsumption = async (
  galponId: number,
  body: CreateConsumptionBody
): Promise<ConsumptionRecord> => {
  const { data } = await apiClient.post<ConsumptionRecord>(
    `/galpones/${galponId}/consumption`,
    body
  )
  return data
}
