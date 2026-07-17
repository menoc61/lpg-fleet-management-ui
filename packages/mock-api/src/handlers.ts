import type { Request, Response, Router } from 'express'
import { Router as makeRouter } from 'express'
import { signToken, verifyToken } from './jwt.ts'
import { AUTH_FIXTURES } from '@lpg/mock-data'
import { listEntities, getEntity, createEntity, updateEntity, deleteEntity } from './db.ts'
import type { EntityName } from './types.ts'

const ACCESS_TTL = 60 * 15 // 15 min
const REFRESH_TTL = 60 * 60 * 24 * 7 // 7 days

function publicUser(fixture: (typeof AUTH_FIXTURES)[number]) {
  return {
    id: fixture.id,
    email: fixture.email,
    firstName: fixture.firstName,
    lastName: fixture.lastName,
    role: fixture.role,
  }
}

function authRouter(): Router {
  const r = makeRouter()

  r.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body ?? {}
    const fixture = AUTH_FIXTURES.find((f) => f.email === email && f.password === password)
    if (!fixture) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides', donnees: null })
    }
    const access = signToken({ sub: fixture.id, role: fixture.role, email: fixture.email, type: 'access' }, ACCESS_TTL)
    const refresh = signToken({ sub: fixture.id, role: fixture.role, email: fixture.email, type: 'refresh' }, REFRESH_TTL)
    return res.json({
      success: true,
      message: 'Connexion reussie',
      donnees: { accessToken: access, refreshToken: refresh, user: publicUser(fixture) },
    })
  })

  r.post('/refresh', (req: Request, res: Response) => {
    const { refreshToken } = req.body ?? {}
    const payload = refreshToken ? verifyToken(refreshToken) : null
    if (!payload || payload.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Refresh token invalide', donnees: null })
    }
    const fixture = AUTH_FIXTURES.find((f) => f.id === payload.sub)
    if (!fixture) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable', donnees: null })
    }
    const access = signToken({ sub: fixture.id, role: fixture.role, email: fixture.email, type: 'access' }, ACCESS_TTL)
    const refresh = signToken({ sub: fixture.id, role: fixture.role, email: fixture.email, type: 'refresh' }, REFRESH_TTL)
    return res.json({
      success: true,
      message: 'Session renouvelee',
      donnees: { accessToken: access, refreshToken: refresh, user: publicUser(fixture) },
    })
  })

  return r
}

function requireAuth(req: Request, res: Response, next: () => void) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const payload = token ? verifyToken(token) : null
  if (!payload || payload.type !== 'access') {
    return res.status(401).json({ success: false, message: 'Non authentifie', donnees: null })
  }
  ;(req as any).auth = payload
  next()
}

function resourceRouter(): Router {
  const r = makeRouter()
  const names: EntityName[] = [
    'organizations',
    'users',
    'sites',
    'trucks',
    'tours',
    'declarations',
    'anomalies',
    'reports',
    'pda',
    'infra',
    'transporters',
  ]

  for (const name of names) {
    r.get(`/${name}`, requireAuth, (req: Request, res: Response) => {
      const page = Number(req.query.page ?? 1)
      const limite = Number(req.query.limite ?? 20)
      const result = listEntities(name, { page, limite })
      res.json({ success: true, message: 'OK', donnees: result.data, pagination: result.pagination })
    })

    r.get(`/${name}/:id`, requireAuth, (req: Request, res: Response) => {
      const item = getEntity(name, req.params.id)
      if (!item) return res.status(404).json({ success: false, message: 'Introuvable', donnees: null })
      res.json({ success: true, message: 'OK', donnees: item })
    })

    r.post(`/${name}`, requireAuth, (req: Request, res: Response) => {
      const item = createEntity(name, req.body ?? {})
      res.status(201).json({ success: true, message: 'Cree', donnees: item })
    })

    r.put(`/${name}/:id`, requireAuth, (req: Request, res: Response) => {
      const item = updateEntity(name, req.params.id, req.body ?? {})
      if (!item) return res.status(404).json({ success: false, message: 'Introuvable', donnees: null })
      res.json({ success: true, message: 'Mis a jour', donnees: item })
    })

    r.delete(`/${name}/:id`, requireAuth, (req: Request, res: Response) => {
      const ok = deleteEntity(name, req.params.id)
      if (!ok) return res.status(404).json({ success: false, message: 'Introuvable', donnees: null })
      res.json({ success: true, message: 'Supprime', donnees: null })
    })
  }

  r.get('/me', requireAuth, (req: Request, res: Response) => {
    const payload = (req as any).auth
    const fixture = AUTH_FIXTURES.find((f) => f.id === payload.sub)
    res.json({ success: true, message: 'OK', donnees: fixture ? publicUser(fixture) : null })
  })

  return r
}

export function createApp(): Router {
  const app = makeRouter()
  app.get('/health', (_req, res) => res.json({ success: true, message: 'mock-api up', donnees: null }))
  app.use('/auth', authRouter())
  app.use('/', resourceRouter())
  return app
}
