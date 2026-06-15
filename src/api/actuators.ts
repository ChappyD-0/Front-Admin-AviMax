import { apiClient } from './client'
import type { Actuador, ComandoPendiente, ProgramacionExtractor } from '../types'

export const getActuadores = async (galponId: number): Promise<Actuador[]> => {
  const { data } = await apiClient.get<Actuador[]>(`/galpones/${galponId}/actuadores`)
  return data
}

export const getPendingCommands = async (galponId: number): Promise<ComandoPendiente[]> => {
  const { data } = await apiClient.get<ComandoPendiente[]>(`/galpones/${galponId}/control/commands/pending`)
  return data
}

export const updateExtractorProgramming = async (
  galponId: number,
  extractorId: number,
  payload: ProgramacionExtractor
): Promise<void> => {
  await apiClient.put(`/galpones/${galponId}/extractors/${extractorId}/programming`, payload)
}

export const sendActuadorCommand = async (
  galponId: number,
  actuadorId: number,
  action: 'ON' | 'OFF'
): Promise<void> => {
  await apiClient.post(`/galpones/${galponId}/actuadores/${actuadorId}/control`, { action })
}
