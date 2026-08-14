import { z } from 'zod'
import type { TourneeType } from '@lpg/types'

export const pickupWizardSchema = z
  .object({
    marketeur_org_id: z.string().min(1, 'Le marketeur est obligatoire'),
    source_site_id: z.string().min(1, 'Le site source est obligatoire'),
    destination_site_id: z.string().min(1, 'Le site destination est obligatoire'),
    requested_quantity: z.number().positive('La quantité demandée doit être > 0'),
    type: z.enum(['VRAC', 'BOUTEILLES50KG'] satisfies readonly [TourneeType, TourneeType]),
  })
  .superRefine((val, ctx) => {
    if (val.source_site_id && val.destination_site_id && val.source_site_id === val.destination_site_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destination_site_id'],
        message: 'chk_pickup_sites_different: le site source et le site destination doivent différer',
      })
    }
  })

export type PickupWizardValues = z.infer<typeof pickupWizardSchema>
