/**
 * Role-aware "Vue d'ensemble" KPI builder.
 *
 * Single source of data for the overview landing dashboard. Pure function
 * (side-effect free) so it can be shared by the page and tested directly.
 *
 * Each role sees a curated subset of the global analytics, expressed as a
 * flat list of `OverviewCard` KPIs (no table — this is a dashboard).
 */

import { buildAnalytics, type Analytics } from '@lpg/mock-data'
import type { Role } from '@lpg/permissions'

export type OverviewCard = {
  id: string
  label: string
  value: number | string
  detail: string
}

const cached = buildAnalytics()

export function buildOverview(role: Role): OverviewCard[] {
  const cardsByRole: Record<string, () => OverviewCard[]> = {
    SUPERADMIN: () => adminCards(cached),
    ADMIN: () => adminCards(cached),
    TRANSPORTEUR: () => transportCards(cached),
    MARKETEUR: () => transportCards(cached),
    SUPERVISOR: () => supervisorCards(cached),
    INTEGRATEUR: () => supervisorCards(cached),
    AGENT: () => agentCards(cached),
  }

  const build = cardsByRole[role]
  return build ? build() : defaultCards(cached)
}

function adminCards(a: Analytics): OverviewCard[] {
  return [
    {
      id: 'organizations',
      label: 'Organisations',
      value: `${a.organizations.active}/${a.organizations.total}`,
      detail: 'actives sur le réseau GPL',
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      value: a.users.active,
      detail: `actifs sur ${a.users.total} comptes totaux`,
    },
    {
      id: 'sites',
      label: 'Sites',
      value: `${a.sites.verified}/${a.sites.active}`,
      detail: 'sites vérifiés et actifs',
    },
    {
      id: 'tours',
      label: 'Tournées',
      value: a.tours.inFlight,
      detail: `en vol · ${a.tours.planned} planifiées`,
    },
    {
      id: 'anomalies',
      label: 'Anomalies ouvertes',
      value: a.anomalies.open,
      detail: `sur ${a.anomalies.total} anomalies détectées`,
    },
    {
      id: 'reconciliations',
      label: 'Réconciliations',
      value: a.reconciliations.total,
      detail: `écart cumulé ${formatVolume(a.reconciliations.totalGap)}`,
    },
  ]
}

function transportCards(a: Analytics): OverviewCard[] {
  return [
    {
      id: 'tours-in-flight',
      label: 'Tournées en vol',
      value: a.tours.inFlight,
      detail: `sur ${a.tours.total} tournées totales`,
    },
    {
      id: 'tours-awaiting',
      label: 'À confirmer transporteur',
      value: a.tours.awaitingTransporter,
      detail: 'tournées en attente de validation',
    },
    {
      id: 'devices',
      label: 'Véhicules & appareils',
      value: a.devices.total,
      detail: 'capteurs et PDA actifs sur la flotte',
    },
    {
      id: 'traceability',
      label: 'Taux de traçabilité',
      value: `${Math.round(a.traceability.traceabilityRate * 100)}%`,
      detail: `volume tracé vs ${formatVolume(a.traceability.declaredVolume)} déclaré`,
    },
  ]
}

function supervisorCards(a: Analytics): OverviewCard[] {
  return [
    {
      id: 'devices-total',
      label: 'Appareils',
      value: a.devices.total,
      detail: 'appareils enregistrés sur le parc',
    },
    {
      id: 'devices-offline',
      label: 'Appareils à attention',
      value: a.devices.attention.length,
      detail: 'batterie critique ou hors ligne',
    },
    {
      id: 'devices-online',
      label: 'Appareils en ligne',
      value: a.devices.byStatus['ONLINE'] ?? 0,
      detail: 'connectés et synchronisés',
    },
    {
      id: 'checkpoints',
      label: 'Points de contrôle',
      value: a.checkpoints.total,
      detail: `${a.checkpoints.missed} manqués`,
    },
  ]
}

function agentCards(a: Analytics): OverviewCard[] {
  return [
    {
      id: 'sites-active',
      label: 'Sites actifs',
      value: a.sites.active,
      detail: `sur ${a.sites.total} sites du réseau`,
    },
    {
      id: 'sites-verified',
      label: 'Sites vérifiés',
      value: a.sites.verified,
      detail: 'sites conformes et vérifiés',
    },
    {
      id: 'reconciliations-gap',
      label: 'Écart de réconciliation',
      value: formatVolume(a.reconciliations.totalGap),
      detail: `${a.reconciliations.total} réconciliations à traiter`,
    },
    {
      id: 'declared-vs-tracked',
      label: 'Déclaré vs tracé',
      value: `${Math.round(a.traceability.traceabilityRate * 100)}%`,
      detail: `tracé · écart ${formatVolume(
        a.traceability.declaredVolume - a.traceability.trackedVolume
      )}`,
    },
  ]
}

function defaultCards(a: Analytics): OverviewCard[] {
  return [
    {
      id: 'organizations',
      label: 'Organisations',
      value: a.organizations.total,
      detail: `${a.organizations.active} actives`,
    },
    {
      id: 'tours-in-flight',
      label: 'Tournées en vol',
      value: a.tours.inFlight,
      detail: `${a.tours.planned} planifiées`,
    },
    {
      id: 'traceability',
      label: 'Taux de traçabilité',
      value: `${Math.round(a.traceability.traceabilityRate * 100)}%`,
      detail: 'volume tracé vs déclaré',
    },
  ]
}

function formatVolume(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(value) + ' TM'
}

export function getOverviewCards(role: Role): OverviewCard[] {
  return buildOverview(role)
}