import type { TransporterContract } from '@lpg/types'

export type ContractStatus =
  | 'CANCELLED'
  | 'SUSPENDED'
  | 'PENDING'
  | 'PENDINGTRANSPORTERACK'
  | 'EXPIRED'
  | 'UPCOMING'
  | 'ACTIVE'

export const contractStatusLabels: Record<ContractStatus, string> = {
  CANCELLED: 'Annulé',
  SUSPENDED: 'Suspendu',
  PENDING: 'Document PDF requis',
  PENDINGTRANSPORTERACK: 'En attente d’acceptation',
  EXPIRED: 'Expiré',
  UPCOMING: 'À venir',
  ACTIVE: 'Actif',
}

export const contractStatusClasses: Record<ContractStatus, string> = {
  CANCELLED: 'bg-slate-100 text-slate-700',
  SUSPENDED: 'bg-amber-100 text-amber-800',
  PENDING: 'bg-orange-100 text-orange-800',
  PENDINGTRANSPORTERACK: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-red-100 text-red-800',
  UPCOMING: 'bg-violet-100 text-violet-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
}

export function deriveContractStatus(
  contract: TransporterContract,
  now: Date,
): ContractStatus {
  if (contract.deleted_at) return 'CANCELLED'
  if (!contract.is_active) return 'SUSPENDED'
  if (!contract.contract_document_url) return 'PENDING'
  if (!contract.transporter_accepted_at) return 'PENDINGTRANSPORTERACK'

  const nowTime = now.getTime()
  if (contract.ended_at && new Date(contract.ended_at).getTime() < nowTime) {
    return 'EXPIRED'
  }
  if (contract.started_at && new Date(contract.started_at).getTime() > nowTime) {
    return 'UPCOMING'
  }
  return 'ACTIVE'
}

export function contractsEligibleForExternal(
  contracts: TransporterContract[],
  marketeurOrgId: string,
  now: Date,
): TransporterContract[] {
  return contracts.filter(
    (contract) =>
      contract.marketeur_org_id === marketeurOrgId &&
      deriveContractStatus(contract, now) === 'ACTIVE',
  )
}
