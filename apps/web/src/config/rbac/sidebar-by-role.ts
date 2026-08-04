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
  Gauge,
  ListChecks,
  Bell,
  MapPin,
  Globe,
  Car,
  FileWarning,
  Flame,
  ScrollText,
  Receipt,
  Settings2,
  ClipboardCheck,
  WalletCards,
} from 'lucide-react'
import { type SidebarData } from '@/components/layout/types'
import { type Role } from './roles'

export const ROLE_SLUGS: Record<Role, string> = {
  SUPERADMIN: 'super-admin',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  INTEGRATEUR: 'integrateur',
  AGENT: 'agent',
  MARKETEUR: 'marketeur',
  TRANSPORTEUR: 'transporteur',
}

export function roleSlug(role: Role): string {
  return ROLE_SLUGS[role]
}

export function roleFromSlug(slug: string): Role | undefined {
  return (Object.keys(ROLE_SLUGS) as Role[]).find(
    (r) => ROLE_SLUGS[r] === slug
  )
}

type BaseItem = {
  title: string
  badge?: string
  icon?: React.ElementType
}

type Item = BaseItem & {
  url: string
  items?: never
}

type CollapsibleItem = BaseItem & {
  url?: never
  items: (BaseItem & { url: string })[]
}

function item(role: Role, module: string, title: string, icon?: React.ElementType, badge?: string): Item {
  return { title, url: `/${roleSlug(role)}/${module}`, icon, badge }
}

function staticLink(url: string, title: string, icon?: React.ElementType, badge?: string): Item {
  return { title, url, icon, badge }
}

function group(title: string, icon: React.ElementType, items: (BaseItem & { url: string })[]): CollapsibleItem {
  return { title, icon, items }
}

const GROUPS: Record<Role, SidebarData> = {
  SUPER_ADMIN: {
    navGroups: [
      {
        title: 'Pilotage national',
        items: [
          item('SUPERADMIN', 'overview', 'Vue d’ensemble nationale', LayoutDashboard),
          item('SUPERADMIN', 'map', 'Carte interactive', MapIcon),
        ],
      },
      {
        title: 'Entités',
        items: [
          group('Organisations & sites', Building2, [
            { title: 'Organisations', url: '/super-admin/organizations', icon: Building2 },
            { title: 'Sites', url: '/super-admin/sites', icon: MapPin },
            { title: 'Zones géographiques', url: '/super-admin/zones', icon: Globe },
          ]),
          item('SUPERADMIN', 'users', 'Utilisateurs (RBAC)', Users),
          group('Camions', Truck, [
            { title: 'Parc camions', url: '/super-admin/trucks', icon: Truck },
            { title: 'Types de véhicule', url: '/super-admin/vehicle-types', icon: Car },
          ]),
          item('SUPERADMIN', 'transporters', 'Transporteurs', Handshake),
          item('SUPERADMIN', 'marketeurs', 'Marketeurs', Building2),
        ],
      },
      {
        title: 'Opérations',
        items: [
          item('SUPERADMIN', 'tours', 'Tournées', Route),
          item('SUPERADMIN', 'deliveries', 'Livraisons', PackageCheck),
          item('SUPERADMIN', 'declarations', 'Déclarations', ClipboardList),
          item('SUPERADMIN', 'reconciliations', 'Réconciliations', ClipboardCheck),
          item('SUPERADMIN', 'redressements', 'Redressements', WalletCards),
          item('SUPERADMIN', 'anomalies', 'Anomalies & fraude', AlertTriangle, '!'),
          item('SUPERADMIN', 'incidents', 'Incidents', Flame),
          item('SUPERADMIN', 'risks', 'Risques', FileWarning),
        ],
      },
      {
        title: 'Configuration',
        items: [
          item('SUPERADMIN', 'custom-roles', 'Rôles personnalisés', ShieldCheck),
          item('SUPERADMIN', 'permissions', 'Matrice de permissions', ShieldCheck),
          item('SUPERADMIN', 'delivery-types', 'Types de livraison', Receipt),
          item('SUPERADMIN', 'tour-statuses', 'Statuts de tournée', ScrollText),
          item('SUPERADMIN', 'reports', 'Rapports & exports', FileBarChart),
          staticLink('/settings/notification-groups', 'Groupes de notification', Bell),
          item('SUPERADMIN', 'audit-logs', "Journal d'audit", ScrollText),
          item('SUPERADMIN', 'settings', 'Paramètres', Settings2),
        ],
      },
      {
        title: 'Monitoring',
        items: [
          item('SUPERADMIN', 'overview', 'Pilotage national', LayoutDashboard),
          staticLink('/activity/trip-tracking', 'Suivi camions (carte)', RadioTower),
          staticLink('/routes', 'Tournées en cours', Route),
          item('SUPERADMIN', 'system-health', 'Santé du système', ServerCog),
        ],
      },
    ],
  },
  ADMIN: {
    navGroups: [
      {
        title: 'Gestion',
        items: [
          staticLink('/dashboard', 'Tableau de bord', LayoutDashboard),
          item('ADMIN', 'users', 'Utilisateurs & organisations', Users),
          item('ADMIN', 'marketeurs', 'Marketeurs', Building2),
          item('ADMIN', 'permissions', 'Matrice de permissions', ShieldCheck),
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
  TRANSPORTEUR: {
    navGroups: [
      {
        title: 'Tableau de bord',
        items: [
          item('TRANSPORTEUR', 'overview', 'Aperçu transporteur', LayoutDashboard),
        ],
      },
      {
        title: 'Tournées',
        items: [
          item('TRANSPORTEUR', 'tours-pending', 'En attente d’accusé', Route),
          item('TRANSPORTEUR', 'tours-active', 'Tournées actives', Route),
          item('TRANSPORTEUR', 'tours-history', 'Historique', Route),
        ],
      },
      {
        title: 'Flotte',
        items: [
          item('TRANSPORTEUR', 'vehicles', 'Camions', Truck),
          item('TRANSPORTEUR', 'drivers', 'Chauffeurs', Users),
          item('TRANSPORTEUR', 'livreurs', 'Livreurs PDA', ListChecks),
        ],
      },
      {
        title: 'Contrats',
        items: [
          item('TRANSPORTEUR', 'contracts', 'Mes contrats', Receipt),
        ],
      },
      {
        title: 'Performance',
        items: [
          item('TRANSPORTEUR', 'performance', 'Performance', Activity),
        ],
      },
    ],
  },
}

export function getSidebarData(role: Role): SidebarData {
  return GROUPS[role]
}
