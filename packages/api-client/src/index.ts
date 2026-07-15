import axios, { type AxiosInstance } from 'axios'
import { type ApiEnvelope } from '@lpg/types'

/** Base API client for the LPG Fleet platform (see CdCF §5.4 envelope). */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 20_000,
})

/** Unwrap the standardised backend envelope and return the payload. */
export async function request<T>(
  config: Parameters<AxiosInstance['request']>[0]
): Promise<T> {
  const res = await apiClient.request<ApiEnvelope<T>>(config)
  if (!res.data.success) {
    throw new Error(res.data.message)
  }
  return res.data.données
}
