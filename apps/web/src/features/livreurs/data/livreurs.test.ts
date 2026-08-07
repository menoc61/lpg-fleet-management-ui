import { describe, expect, it } from 'vitest'
import { getLivreurs, livreurStatusLabel } from './livreurs'

describe('livreurs view-model', () => {
  it('only includes users with the LIVREUR role', () => {
    const livreurs = getLivreurs()
    expect(livreurs.length).toBe(5)
    for (const livreur of livreurs) {
      expect(livreur.fullName).toBeTruthy()
      expect(livreur.orgName).toBeTruthy()
    }
  })

  it('labels statuses in French', () => {
    expect(livreurStatusLabel('ACTIVE')).toBe('Actif')
    expect(livreurStatusLabel('INACTIVE')).toBe('Inactif')
  })
})