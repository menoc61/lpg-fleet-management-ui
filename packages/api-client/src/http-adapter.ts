import axios, { type AxiosInstance } from 'axios'
import type { ApiEnvelope } from '@lpg/types'
import type { ApiAdapter, AuthResult, Credentials } from './adapter.ts'

type AccessTokenGetter = () => string | null
type UnauthorizedHandler = () => void

/**
 * HTTP implementation of {@link ApiAdapter}. Used for every environment
 * (`mock` | `dev` | `production`); only the base URL changes. Handles bearer
 * token attachment and a single silent refresh on 401 before retrying.
 */
export function createHttpAdapter(baseURL?: string): ApiAdapter {
  const client: AxiosInstance = axios.create({
    baseURL: baseURL ?? import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
    timeout: 20_000,
  })

  let getAccessToken: AccessTokenGetter = () => null
  let onUnauthorized: UnauthorizedHandler = () => {}
  let isRefreshing = false

  client.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers ?? {}
      ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true
        if (!isRefreshing) {
          isRefreshing = true
          try {
            await onUnauthorized()
          } finally {
            isRefreshing = false
          }
        }
        const token = getAccessToken()
        if (token) {
          original.headers = original.headers ?? {}
          original.headers.Authorization = `Bearer ${token}`
          return client(original)
        }
      }
      return Promise.reject(error)
    }
  )

  async function request<T>(path: string, init?: { method?: string; body?: string; headers?: Record<string, string> }): Promise<T> {
    const res = await client.request<ApiEnvelope<T>>({
      url: path,
      method: (init?.method as any) ?? 'GET',
      data: init?.body,
      headers: init?.headers,
    })
    if (!res.data.success) {
      throw new Error(res.data.message || 'Request failed')
    }
    return res.data.donnees
  }

  return {
    request,
    async login(creds: Credentials): Promise<AuthResult> {
      const res = await client.post<ApiEnvelope<AuthResult>>('/auth/login', creds)
      if (!res.data.success) throw new Error(res.data.message)
      return res.data.donnees
    },
    async refresh(refreshToken: string): Promise<AuthResult> {
      const res = await client.post<ApiEnvelope<AuthResult>>('/auth/refresh', { refreshToken })
      if (!res.data.success) throw new Error(res.data.message)
      return res.data.donnees
    },
    setAccessTokenGetter(getter) {
      getAccessToken = getter
    },
    setOnUnauthorized(handler) {
      onUnauthorized = handler
    },
  }
}

/** App-wide singleton adapter. */
export const apiAdapter = createHttpAdapter()
