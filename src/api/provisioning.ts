import { apiClient } from './client'
import type { GalponListItem, NuevoGalponForm, ProvisioningDetail } from '../types'

export const getGalpones = async (): Promise<GalponListItem[]> => {
  const { data } = await apiClient.get<GalponListItem[]>('/provisioning/galpones')
  return data
}

export const getProvisioningDetail = async (id: number): Promise<ProvisioningDetail> => {
  const { data } = await apiClient.get<ProvisioningDetail>(`/provisioning/galpones/${id}`)
  return data
}

export const createGalpon = async (form: NuevoGalponForm): Promise<ProvisioningDetail> => {
  const { data } = await apiClient.post<ProvisioningDetail>('/provisioning/galpones', form)
  return data
}
