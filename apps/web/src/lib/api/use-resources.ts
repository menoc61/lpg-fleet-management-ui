import { useQuery } from '@tanstack/react-query'
import { api } from '@lpg/api-client'

export const organizationsHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['organizations', params],
      queryFn: () => api.organizations.list(params).then((r) => r.data),
    })
  },
  useOne(id: string) {
    return useQuery<any, Error>({
      queryKey: ['organizations', id],
      queryFn: () => api.organizations.getById(id),
    })
  },
}

export const vehiclesHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['vehicles', params],
      queryFn: () => api.vehicles.list(params).then((r) => r.data),
    })
  },
  useOne(id: string) {
    return useQuery<any, Error>({
      queryKey: ['vehicles', id],
      queryFn: () => api.vehicles.getById(id),
    })
  },
}

export const trucksHooks = vehiclesHooks

export const deliveryToursHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['delivery_tours', params],
      queryFn: () => api.deliveryTours.list(params).then((r) => r.data),
    })
  },
  useOne(id: string) {
    return useQuery<any, Error>({
      queryKey: ['delivery_tours', id],
      queryFn: () => api.deliveryTours.getById(id),
    })
  },
}

export const sitesHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['sites', params],
      queryFn: () => api.sites.list(params).then((r) => r.data),
    })
  },
  useOne(id: string) {
    return useQuery<any, Error>({
      queryKey: ['sites', id],
      queryFn: () => api.sites.getById(id),
    })
  },
}

export const declarationsHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['declarations', params],
      queryFn: () => api.declarations.list(params).then((r) => r.data),
    })
  },
  useOne(id: string) {
    return useQuery<any, Error>({
      queryKey: ['declarations', id],
      queryFn: () => api.declarations.getById(id),
    })
  },
}

export const anomaliesHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['anomalies', params],
      queryFn: () => api.anomalies.list(params).then((r) => r.data),
    })
  },
}

export const usersHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['users', params],
      queryFn: () => api.users.list(params).then((r) => r.data),
    })
  },
}

export const devicesHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['devices', params],
      queryFn: () => api.devices.list(params).then((r) => r.data),
    })
  },
}

export const reconciliationsHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['reconciliations', params],
      queryFn: () => api.reconciliations.list(params).then((r) => r.data),
    })
  },
}

export const redressementsHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['redressements', params],
      queryFn: () => api.redressements.list(params).then((r) => r.data),
    })
  },
}

export const riskScoresHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['risk_scores', params],
      queryFn: () => api.riskScores.list(params).then((r) => r.data),
    })
  },
}

export const notificationsHooks = {
  useList(params?: Record<string, string | number | boolean>) {
    return useQuery<any, Error>({
      queryKey: ['notifications', params],
      queryFn: () => api.notifications.list(params).then((r) => r.data),
    })
  },
}