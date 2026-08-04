import { useQuery } from '@tanstack/react-query'
import { api } from '@lpg/api-client'

export const trucksHooks = {
  useOne(truckId: string) {
    return useQuery<any, Error>({
      queryKey: ['vehicles', truckId],
      queryFn: () => api.vehicles.getById(truckId),
    })
  },
  useList(params?: Record<string, string | number>) {
    return useQuery<any, Error>({
      queryKey: ['vehicles', params],
      queryFn: () => api.vehicles.list(params).then((r) => r.data),
    })
  },
}

export const toursHooks = {
  useList(params?: Record<string, string | number>) {
    return useQuery<any, Error>({
      queryKey: ['tours', params],
      queryFn: () => api.tours.list(params).then((r) => r.data),
    })
  },
}

export const sitesHooks = {
  useList(params?: Record<string, string | number>) {
    return useQuery<any, Error>({
      queryKey: ['sites', params],
      queryFn: () => api.sites.list(params).then((r) => r.data),
    })
  },
}

export const declarationsHooks = {
  useList(params?: Record<string, string | number>) {
    return useQuery<any, Error>({
      queryKey: ['declarations', params],
      queryFn: () => api.declarations.list(params).then((r) => r.data),
    })
  },
}
