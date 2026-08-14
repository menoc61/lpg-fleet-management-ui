import { describe, expect, it } from 'vitest'
import { describeFeedback, extractErrorMessage } from './use-toast-feedback'

describe('extractErrorMessage', () => {
  it('returns a thrown message', () => {
    expect(extractErrorMessage(new Error('Transition interdite'))).toBe(
      'Transition interdite',
    )
  })

  it('falls back for unknown errors', () => {
    expect(extractErrorMessage(undefined)).toBe('Une erreur est survenue. Réessayez.')
    expect(extractErrorMessage({ code: 123 })).toBe(
      'Une erreur est survenue. Réessayez.',
    )
  })
})

describe('describeFeedback', () => {
  it('composes verb + entity', () => {
    expect(describeFeedback('créée', 'Requête')).toBe('Requête créée.')
  })
})
