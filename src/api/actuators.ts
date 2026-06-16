import { apiClient } from './client'
import type {
  Actuador, ComandoPendiente,
  CriadoraDto, CreateCriadoraBody,
  BombaDto, CreateBombaBody,
  UnifiedProgrammingBody, UnifiedProgrammingResult,
  ProgrammingHistoryEntry, EvaluationResult,
} from '../types'

export const getActuadores = async (galponId: number): Promise<Actuador[]> => {
  const { data } = await apiClient.get<Actuador[]>(`/galpones/${galponId}/actuadores`)
  return data
}

export const getPendingCommands = async (galponId: number): Promise<ComandoPendiente[]> => {
  const { data } = await apiClient.get<ComandoPendiente[]>(`/galpones/${galponId}/control/commands/pending`)
  return data
}

export const sendActuadorCommand = async (
  galponId: number,
  actuadorId: number,
  action: 'ON' | 'OFF',
  actuatorType: 'EXTRACTOR' | 'CRIADORA' | 'BOMBA'
): Promise<void> => {
  await apiClient.post(`/galpones/${galponId}/control/manual`, {
    actuatorType,
    actuatorId: actuadorId,
    action,
    dispatchNow: true,
  })
}

// ── Criadoras ────────────────────────────────────────────────────────────────

export const getCriadoras = async (galponId: number): Promise<CriadoraDto[]> => {
  const { data } = await apiClient.get<CriadoraDto[]>(`/galpones/${galponId}/criadoras`)
  return data
}

export const createCriadora = async (
  galponId: number,
  body: CreateCriadoraBody
): Promise<CriadoraDto> => {
  const { data } = await apiClient.post<CriadoraDto>(`/galpones/${galponId}/criadoras`, body)
  return data
}

export const getCriadoraHistory = async (
  galponId: number,
  criadoraId: number
): Promise<ProgrammingHistoryEntry[]> => {
  const { data } = await apiClient.get<ProgrammingHistoryEntry[]>(
    `/galpones/${galponId}/criadoras/${criadoraId}/history`
  )
  return data
}

// ── Bombas ────────────────────────────────────────────────────────────────────

export const getBombas = async (galponId: number): Promise<BombaDto[]> => {
  const { data } = await apiClient.get<BombaDto[]>(`/galpones/${galponId}/bombas`)
  return data
}

export const createBomba = async (
  galponId: number,
  body: CreateBombaBody
): Promise<BombaDto> => {
  const { data } = await apiClient.post<BombaDto>(`/galpones/${galponId}/bombas`, body)
  return data
}

export const getBombaHistory = async (
  galponId: number,
  bombaId: number
): Promise<ProgrammingHistoryEntry[]> => {
  const { data } = await apiClient.get<ProgrammingHistoryEntry[]>(
    `/galpones/${galponId}/bombas/${bombaId}/history`
  )
  return data
}

// ── Unified MQTT programming ──────────────────────────────────────────────────

export const setUnifiedProgramming = async (
  galponId: number,
  actuatorType: 'extractor' | 'criadora' | 'bomba',
  actuatorId: number,
  body: UnifiedProgrammingBody
): Promise<UnifiedProgrammingResult> => {
  const { data } = await apiClient.put<UnifiedProgrammingResult>(
    `/galpones/${galponId}/actuadores/${actuatorType}/${actuatorId}/programming`,
    body
  )
  return data
}

// ── Control ────────────────────────────────────────────────────────────────────

export const evaluateLatest = async (galponId: number): Promise<EvaluationResult> => {
  const { data } = await apiClient.post<EvaluationResult>(
    `/galpones/${galponId}/control/evaluate/latest`
  )
  return data
}

export const dispatchCommand = async (commandId: number): Promise<void> => {
  await apiClient.post(`/control/commands/${commandId}/dispatch`)
}
