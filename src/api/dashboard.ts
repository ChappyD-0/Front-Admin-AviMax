import { apiClient } from './client'
import type { DashboardGeneral } from '../types'

export const getDashboardGeneral = async (): Promise<DashboardGeneral> => {
  const { data } = await apiClient.get<DashboardGeneral>('/dashboard/general')
  return data
}
