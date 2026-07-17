import { apiAdapter } from './http-adapter.ts'
import { createApi } from './api.ts'

export type { ApiAdapter, AuthResult, AuthUser, Credentials, ListResponse, ListResult, ApiPagination } from './adapter.ts'
export { apiAdapter } from './http-adapter.ts'
export { createApi } from './api.ts'

/** Default app-wide API client bound to the singleton HTTP adapter. */
export const api = createApi(apiAdapter)
