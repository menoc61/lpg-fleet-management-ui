import {
  LayoutDashboard,
  Building2,
  Handshake,
  Users,
  FileBarChart,
  ShieldCheck,
  RadioTower,
  Truck,
  Route,
  PackageCheck,
  Map as MapIcon,
  AlertTriangle,
  Activity,
  Boxes,
  ClipboardList,
  KeyRound,
  ServerCog,
  ScanLine,
  Upload,
  RefreshCw,
  Gauge,
  Wallet,
  ListChecks,
  Bell,
} from 'lucide-react'
import { type SidebarData } from '@/components/layout/types'
import { type Role } from './roles'

export const ROLE_SLUGS: Record<Role, string> = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  INTEGRATEUR: 'integrateur',
  AGENT: 'agent',
  MARKETEUR: 'marketeur',
  LIVREUR: 'livreur',
}

export function roleSlug(role: Role): string {
  return ROLE_SLUGS[role]
}

export function roleFromSlug(slug: string): Role | undefined {
  return (Object.keys(ROLE_SLUGS) as Role[]).find(
    (r) => ROLE_SLUGS[r] === slug
  )
}

type Item = {
  title: string
  url: string
  icon?: React.ElementType
  badge?: string
}

function item(role: Role, module: string, title: string, icon?: React.ElementType, badge?: string): Item {
  return { title, url: `/${roleSlug(role)}/${module}`, icon, badge }
}

/** A direct link to a top-level static feature page (e.g. /dashboard, /routes). */
function staticLink(url: string, title: string, icon?: React.ElementType, badge?: string): Item {
  return { title, url, icon, badge }
}

const GROUPS: Record<Role, SidebarData> = {
  SUPER_ADMIN: {
    navGroups: [
      {
        title: 'Pilotage national',
        items: [
          item('SUPER_ADMIN', 'overview', 'Vue d’ensemble nationale', LayoutDashboard),
          item('SUPER_ADMIN', 'map', 'Carte ultra-détaillée', MapIcon),
          item('SUPER_ADMIN', 'finance', 'Indicateurs financiers', Wallet),
        ],
      },
      {
        title: 'Supervision',
        items: [
          item('SUPER_ADMIN', 'organizations', 'Organisations & sites', Building2),
          item('SUPER_ADMIN', 'users', 'Utilisateurs (RBAC)', Users),
          item('SUPER_ADMIN', 'anomalies', 'Anomalies & fraude', AlertTriangle, '!'),
          item('SUPER_ADMIN', 'reports', 'Rapports & exports', FileBarChart),
          staticLink('/settings/notification-groups', 'Groupes de notification', Bell),
        ],
      },
      {
        title: 'Applications métier',
        items: [
          staticLink('/dashboard', 'Tableau de bord', LayoutDashboard),
          staticLink('/routes', 'Tournées', Route),
          staticLink('/activity/trip-tracking', 'Suivi camions', RadioTower),
          staticLink('/trucks', 'Camions', Truck),
          staticLink('/transporters', 'Transporteurs', Building2),
          staticLink('/marketers', 'Marketeurs', Handshake),
        ],
      },
    ],
  },
  ADMIN: {
    navGroups: [
      {
        title: 'Gestion',
        items: [
          item('ADMIN', 'overview', 'Tableau de bord', LayoutDashboard),
          item('ADMIN', 'users', 'Utilisateurs & organisations', Users),
          item('ADMIN', 'marketeurs', 'Marketeurs', Building2),
        ],
      },
      {
        title: 'Contrôle',
        items: [
          item('ADMIN', 'declarations', 'Déclarations à valider', ClipboardList),
          item('ADMIN', 'reports', 'Rapports de conformité', FileBarChart),
          item('ADMIN', 'alert-rules', 'Règles d’alerte', ShieldCheck),
        ],
      },
    ],
  },
  SUPERVISOR: {
    navGroups: [
      {
        title: 'Monitoring',
        items: [
          item('SUPERVISOR', 'overview', 'Métriques système', Gauge),
          item('SUPERVISOR', 'infra', 'Dashboards infra (Grafana)', ServerCog),
          item('SUPERVISOR', 'risk', 'Scores de risque', AlertTriangle),
        ],
      },
      {
        title: 'Technique',
        items: [
          item('SUPERVISOR', 'logs', 'Logs centralisés', Activity),
          item('SUPERVISOR', 'alerts', 'Alertes infrastructure', AlertTriangle, '!'),
        ],
      },
    ],
  },
  INTEGRATEUR: {
    navGroups: [
      {
        title: 'Matériel IoT',
        items: [
          item('INTEGRATEUR', 'overview', 'Activation matériel', RadioTower),
          item('INTEGRATEUR', 'pda', 'PDA + GPS + RFID', ScanLine),
          item('INTEGRATEUR', 'auth', 'Authentification', KeyRound),
        ],
      },
      {
        title: 'Maintenance',
        items: [
          item('INTEGRATEUR', 'fleet-iot', 'Parc équipements', Boxes),
          item('INTEGRATEUR', 'logs', 'Logs maintenance', Activity),
        ],
      },
    ],
  },
  AGENT: {
    navGroups: [
      {
        title: 'Suivi terrain',
        items: [
          item('AGENT', 'overview', 'Vue consolidée', LayoutDashboard),
          item('AGENT', 'marketeurs', 'Marketeurs', Building2),
          item('AGENT', 'declarations', 'Déclarations en attente', ClipboardList),
        ],
      },
      {
        title: 'Actions',
        items: [
          item('AGENT', 'visits', 'Rapports de visite', ListChecks),
          item('AGENT', 'passwords', 'Réinitialisation mots de passe', KeyRound),
          item('AGENT', 'anomalies', 'Anomalies à investiguer', AlertTriangle),
        ],
      },
    ],
  },
  MARKETEUR: {
    navGroups: [
      {
        title: 'Ma flotte',
        items: [
          item('MARKETEUR', 'overview', 'État de la flotte', LayoutDashboard),
          item('MARKETEUR', 'trucks', 'Camions & chauffeurs', Truck),
          item('MARKETEUR', 'quotas', 'Quotas & volumes', Gauge),
        ],
      },
      {
        title: 'Opérations',
        items: [
          item('MARKETEUR', 'supply', 'Requête d’enlèvement', PackageCheck),
          item('MARKETEUR', 'delivery-tours', 'Tournées de livraison', Route),
          item('MARKETEUR', 'clients', 'Clients & livraisons', Handshake),
        ],
      },
      {
        title: 'Pilotage',
        items: [
          item('MARKETEUR', 'performance', 'Performance chauffeurs', Activity),
          item('MARKETEUR', 'reports', 'Rapports', FileBarChart),
        ],
      },
    ],
  },
  LIVREUR: {
    navGroups: [
      {
        title: 'Ma tournée',
        items: [
          item('LIVREUR', 'missions', 'Missions du jour', ListChecks),
          item('LIVREUR', 'scan', 'Scan RFID (IN/OUT)', ScanLine),
        ],
      },
      {
        title: 'PDA',
        items: [
          item('LIVREUR', 'upload', 'Téléversement', Upload),
          item('LIVREUR', 'sync', 'Rapport de synchronisation', RefreshCw),
        ],
      },
    ],
  },
}

export function getSidebarData(role: Role): SidebarData {
  return GROUPS[role]
}
