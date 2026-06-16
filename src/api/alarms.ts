import { apiClient } from './client'
import type { Alarma, AlarmEvent, Regla, CreateRuleBody } from '../types'

// ── Alarms ────────────────────────────────────────────────────────────────────

export const getActiveAlarms = async (): Promise<Alarma[]> => {
  const { data } = await apiClient.get<Alarma[]>('/alarms/active')
  return data
}

export const getAlarms = async (params?: { galpon_id?: number }): Promise<Alarma[]> => {
  const { data } = await apiClient.get<Alarma[]>('/alarms', { params })
  return data
}

export const getAlarmsByGalpon = async (id: number): Promise<Alarma[]> =>
  getAlarms({ galpon_id: id })

export const getAlarmsHistory = async (params?: { galpon_id?: number }): Promise<Alarma[]> => {
  const { data } = await apiClient.get<Alarma[]>('/alarms/history', { params })
  return data
}

export const getAlarmEvents = async (alarmId: number): Promise<AlarmEvent[]> => {
  const { data } = await apiClient.get<AlarmEvent[]>(`/alarms/${alarmId}/events`)
  return data
}

export const acknowledgeAlarm = async (alarmId: number): Promise<Alarma> => {
  const { data } = await apiClient.post<Alarma>(`/alarms/${alarmId}/acknowledge`)
  return data
}

export const closeAlarm = async (alarmId: number): Promise<Alarma> => {
  const { data } = await apiClient.post<Alarma>(`/alarms/${alarmId}/close`)
  return data
}

// ── Rules ─────────────────────────────────────────────────────────────────────

export const getRules = async (params?: { galponId?: number }): Promise<Regla[]> => {
  const { data } = await apiClient.get<Regla[]>('/alarms/rules', { params })
  return data
}

export const createRule = async (body: CreateRuleBody): Promise<Regla> => {
  const { data } = await apiClient.post<Regla>('/alarms/rules', body)
  return data
}

export const updateRule = async (ruleId: number, body: Partial<CreateRuleBody>): Promise<Regla> => {
  const { data } = await apiClient.put<Regla>(`/alarms/rules/${ruleId}`, body)
  return data
}

export const toggleRuleActive = async (ruleId: number, active: boolean): Promise<Regla> => {
  const { data } = await apiClient.patch<Regla>(`/alarms/rules/${ruleId}/active`, { active })
  return data
}
