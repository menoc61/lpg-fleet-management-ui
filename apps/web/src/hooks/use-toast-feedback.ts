import { AxiosError } from 'axios'
import { toast } from 'sonner'

/**
 * Standardized mutation feedback (AGENTS.md §4 "Toasts"): exactly one toast
 * per outcome. `runMutation` fires the success toast on resolve and a single
 * error toast on reject (via `extractErrorMessage`), then rethrows so the
 * caller can still branch on the failure.
 */

/** French, user-friendly message for a thrown error (no toast here). */
export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  if (error instanceof AxiosError) {
    const title = error.response?.data?.title
    if (typeof title === 'string' && title.length > 0) return title
    const status = error.response?.status
    if (status === 401) return 'Session expirée. Veuillez vous reconnecter.'
    if (status === 403) return 'Accès refusé.'
    if (status === 404) return 'Ressource introuvable.'
    if (status === 409) return 'Conflit avec l’état actuel des données.'
  }
  if (error instanceof TypeError && /fetch|network|failed/i.test(error.message)) {
    return 'Réseau indisponible.'
  }
  return 'Une erreur est survenue. Réessayez.'
}

export function describeFeedback(verb: string, entity: string): string {
  return `${entity} ${verb}.`
}

export async function runMutation<T>(
  fn: () => Promise<T>,
  opts: { success?: string; error?: string } = {},
): Promise<T> {
  try {
    const result = await fn()
    toast.success(opts.success ?? 'Opération effectuée.')
    return result
  } catch (err) {
    const message = opts.error ?? extractErrorMessage(err)
    toast.error(message)
    throw err
  }
}
