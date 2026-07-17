import type {
  Organization,
  AppUser,
  Site,
  Truck,
  Tour,
  Declaration,
  Anomaly,
  Report,
  PdaDevice,
  InfraMetric,
  Transporter,
} from '@lpg/types'
import type { ApiAdapter, AuthResult, AuthUser, Credentials } from './adapter.ts'
import { createResourceService } from './resource.ts'

/** Auth service — wraps the adapter's login/refresh and current-user fetch. */
export function createAuthService(adapter: ApiAdapter) {
  return {
    login(creds: Credentials): Promise<AuthResult> {
      return adapter.login(creds)
    },
    refresh(refreshToken: string): Promise<AuthResult> {
      return adapter.refresh(refreshToken)
    },
    me(): Promise<AuthUser> {
      return adapter.request<AuthUser>('/me')
    },
  }
}

/** The data API surface used by feature code. Swap backend = swap adapter only. */
export function createApi(adapter: ApiAdapter) {
  return {
    auth: createAuthService(adapter),
    organizations: createResourceService<Organization>(adapter, 'organizations'),
    users: createResourceService<AppUser>(adapter, 'users'),
    sites: createResourceService<Site>(adapter, 'sites'),
    trucks: createResourceService<Truck>(adapter, 'trucks'),
    tours: createResourceService<Tour>(adapter, 'tours'),
    declarations: createResourceService<Declaration>(adapter, 'declarations'),
    anomalies: createResourceService<Anomaly>(adapter, 'anomalies'),
    reports: createResourceService<Report>(adapter, 'reports'),
    pda: createResourceService<PdaDevice>(adapter, 'pda'),
    infra: createResourceService<InfraMetric>(adapter, 'infra'),
    transporters: createResourceService<Transporter>(adapter, 'transporters'),
  }
}

