/**
 * Permission-driven module registry.
 *
 * Every screen the role switcher / generic module renderer can mount is
 * declared exactly once here, tagged with the permission codes (from
 * `@lpg/permissions`) an actor must hold to see it.
 *
 * `buildModulesFor(role)` projects this master list onto a `Role`. This
 * mirrors `nav-items.ts` — both the sidebar and the generic module grid
 * derive from the same `ROLE_GRANTS` matrix, so the role only ever sees
 * modules it can actually access.
 *
 * No role/modulename is hardcoded in a consumer — adding a new module is a
 * one-line change in this file.
 */

import {
  hasPermission,
  type PermissionCode,
  type Role,
} from '@lpg/permissions'
import {
  Activity,
  AlertTriangle,
  Building2,
  ClipboardList,
  FileWarning,
  Gauge,
  IdCard,
  Layers,
  MapPin,
  PackageCheck,
  Route,
  ScrollText,
  ServerCog,
  Truck,
  TrendingUp,
  UserCog,
  Wallet,
  Warehouse,
} from 'lucide-react'
import type { ModuleDefinition, ModuleRegistry } from './types'

export interface ModuleDecl extends ModuleDefinition {
  /** Stable identifier — used as registry key. Same id used in NAV_CATALOG. */
  id: string
  /** Roles a module is *advertised* for — caller must still pass the right
   *  role to the router. Used to scope the registry; runtime gating is done
   *  by `requires`. */
  scope: readonly Role[]
  /** Permission codes the active role MUST hold to see this module. */
  requires: readonly PermissionCode[]
}

/* --------------------------------------------------------------------------
 * TABLE STATUS / TYPE OPTIONS — derived from the schema enums at the source.
 *
 * To add a status option: edit `@lpg/types` (the schema enum), then add a
 * matching `{ label, value }` here. Don't hardcode unrelated string values.
 * --------------------------------------------------------------------------*/

import {
  siteStatusOptions,
  tourneeStatusOptions,
  shipmentStatusOptions,
  reconciliationStatusOptions,
  redressementStatusOptions,
  violationStatusOptions,
  riskLevelOptions,
  vehicleTypeOptions,
  orgTypeOptions,
  deviceTypeOptions,
  checkStatusOptions,
  syncStatusOptions,
  type OptionDef,
} from './field-options'

function badged<T extends string>(options: readonly OptionDef<T>[]) {
  return options.map((o) => ({ label: o.label, value: o.value }))
}

const STATUS_ACTIVE_BADGE = badged(siteStatusOptions)
const STATUS_TOUR = badged(tourneeStatusOptions)
const STATUS_SHIP = badged(shipmentStatusOptions)
const STATUS_RECON = badged(reconciliationStatusOptions)
const STATUS_REDRESS = badged(redressementStatusOptions)
const STATUS_VIOLATION = badged(violationStatusOptions)
const STATUS_RISK = badged(riskLevelOptions)
const STATUS_CHECK = badged(checkStatusOptions)
const STATUS_SYNC = badged(syncStatusOptions)

const TYPE_VEHICLE = badged(vehicleTypeOptions)
const TYPE_ORG = badged(orgTypeOptions)
const TYPE_DEVICE = badged(deviceTypeOptions)

/* --------------------------------------------------------------------------
 * Module declarations — single source of truth.
 *
 * Each entry is *displayable by the generic module-screen.tsx renderer*.
 * Bespoke screens (Sidebar-driven dashboards, map views, role homepages) are
 * kept in `roles/manifest.ts` and continue to be hardcoded bespoke screens —
 * they are not generic tables.
 * --------------------------------------------------------------------------*/

export const MODULE_CATALOG: readonly ModuleDecl[] = [
  /* ===== SUPERADMIN scope ===== */
  {
    id: 'overview',
    title: "Vue d'ensemble nationale",
    description: 'KPIs nationaux, volumes, traçabilité et anomalies agrégées.',
    icon: Gauge,
    scope: ['SUPERADMIN'],
    requires: ['reports.read'],
    mockCount: 20,
    fields: [
      { key: 'region', header: 'Région', type: 'text', filterable: true },
      { key: 'traceability_rate', header: 'Traçabilité %', type: 'number' },
      { key: 'declared_volume', header: 'Volume (t)', type: 'number' },
      { key: 'anomaly_count', header: 'Anomalies', type: 'number' },
      { key: 'updated_at', header: 'Mis à jour', type: 'date' },
    ],
  },
  {
    id: 'map',
    title: 'Carte interactive',
    description: 'Vue cartographique nationale des sites, tournées et anomalies.',
    icon: MapPin,
    scope: ['SUPERADMIN'],
    requires: ['sites.read', 'tours.read'],
    mockCount: 18,
    fields: [
      { key: 'name', header: 'Site', type: 'text', filterable: true },
      { key: 'region', header: 'Région', type: 'text', filterable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true },
      { key: 'updated_at', header: 'Mis à jour', type: 'date' },
    ],
  },
  {
    id: 'finance',
    title: 'Indicateurs financiers',
    description: 'Subventions, écarts et économies réalisées.',
    icon: Wallet,
    scope: ['SUPERADMIN'],
    requires: ['subsidies.read'],
    mockCount: 20,
    fields: [
      { key: 'org_name', header: 'Organisation', type: 'text', filterable: true },
      { key: 'subsidy_impact', header: 'Subvention', type: 'currency' },
      { key: 'volume_gap', header: 'Écart', type: 'currency' },
      { key: 'saved_amount', header: 'Économies', type: 'currency' },
      { key: 'period', header: 'Période', type: 'date' },
    ],
  },
  {
    id: 'transporters',
    title: 'Transporteurs',
    description: 'Parc transporteurs, contrats et validations externes.',
    icon: Truck,
    scope: ['SUPERADMIN'],
    requires: ['transporters.read'],
    mockCount: 24,
    fields: [
      { key: 'name', header: 'Transporteur', type: 'text', filterable: true },
      { key: 'contract_count', header: 'Contrats actifs', type: 'number' },
      { key: 'vehicle_count', header: 'Véhicules', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true, groupable: true },
      { key: 'updated_at', header: 'Modifié le', type: 'date' },
    ],
  },
  {
    id: 'marketeurs',
    title: 'Marketeurs',
    description: 'Suivi national des marketeurs et indicateurs agrégés.',
    icon: Building2,
    scope: ['SUPERADMIN'],
    requires: ['markets.read'],
    mockCount: 26,
    fields: [
      { key: 'name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'quota', header: 'Quota (kg)', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true },
      { key: 'declared_at', header: 'Déclaration', type: 'date' },
    ],
  },
  {
    id: 'organizations',
    title: 'Organisations & sites',
    description: 'Toutes les organisations et leurs sites localisés.',
    icon: Warehouse,
    scope: ['SUPERADMIN'],
    requires: ['orgs.read'],
    mockCount: 30,
    fields: [
      { key: 'name', header: 'Organisation', type: 'text', filterable: true },
      { key: 'type', header: 'Type', type: 'badge', options: TYPE_ORG, filterable: true, groupable: true },
      { key: 'site_count', header: 'Sites', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true },
      { key: 'created_at', header: 'Créé le', type: 'date' },
    ],
  },
  {
    id: 'users',
    title: 'Utilisateurs (RBAC)',
    description: 'Gestion des utilisateurs et rôles.',
    icon: UserCog,
    scope: ['SUPERADMIN'],
    requires: ['users.read'],
    mockCount: 40,
    fields: [
      { key: 'full_name', header: 'Nom', type: 'text', filterable: true },
      { key: 'email', header: 'Email', type: 'text' },
      { key: 'system_role', header: 'Rôle', type: 'badge', options: TYPE_ORG, filterable: true, groupable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true },
      { key: 'last_login_at', header: 'Dernière connexion', type: 'date' },
    ],
  },
  {
    id: 'tours',
    title: 'Tournées',
    description: 'Tournées de livraison/approvisionnement.',
    icon: Route,
    scope: ['SUPERADMIN', 'MARKETEUR', 'TRANSPORTEUR', 'ADMIN', 'AGENT'],
    requires: ['tours.read'],
    mockCount: 36,
    fields: [
      { key: 'reference', header: 'Tournée', type: 'text', filterable: true },
      { key: 'type', header: 'Type', type: 'badge', options: TYPE_VEHICLE, filterable: true, groupable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_TOUR, filterable: true, groupable: true },
      { key: 'marketeur_name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'started_at', header: 'Début', type: 'date' },
    ],
  },
  {
    id: 'declarations',
    title: 'Déclarations',
    description: 'Déclarations de ventes marketeurs.',
    icon: ClipboardList,
    scope: ['SUPERADMIN', 'ADMIN', 'MARKETEUR', 'AGENT'],
    requires: ['declarations.read'],
    mockCount: 28,
    fields: [
      { key: 'marketeur_name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'period', header: 'Période', type: 'text' },
      { key: 'declared_volume', header: 'Volume déclaré', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_SHIP, filterable: true, groupable: true },
      { key: 'submitted_at', header: 'Soumis le', type: 'date' },
    ],
  },
  {
    id: 'reconciliations',
    title: 'Réconciliations',
    description: 'Écarts déclarés vs scannés et suivi de péréquation.',
    icon: ScrollText,
    scope: ['SUPERADMIN', 'ADMIN', 'AGENT'],
    requires: ['reconciliations.read'],
    mockCount: 26,
    fields: [
      { key: 'declaration_ref', header: 'Déclaration', type: 'text', filterable: true },
      { key: 'tracked_volume', header: 'Volume tracké', type: 'number' },
      { key: 'volume_gap', header: 'Écart volume', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_RECON, filterable: true, groupable: true },
      { key: 'verified_at', header: 'Vérifié le', type: 'date' },
    ],
  },
  {
    id: 'redressements',
    title: 'Redressements',
    description: 'Suivi des redressements financiers.',
    icon: Wallet,
    scope: ['SUPERADMIN'],
    requires: ['redressements.read'],
    mockCount: 24,
    fields: [
      { key: 'reconciliation_ref', header: 'Réconciliation', type: 'text', filterable: true },
      { key: 'amount', header: 'Montant FCFA', type: 'currency' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_REDRESS, filterable: true, groupable: true },
      { key: 'issued_at', header: 'Émis le', type: 'date' },
      { key: 'paid_at', header: 'Payé le', type: 'date' },
    ],
  },
  {
    id: 'anomalies',
    title: 'Anomalies & fraude',
    description: 'Détection par régression linéaire et écarts déclarés/scannés.',
    icon: AlertTriangle,
    scope: ['SUPERADMIN', 'ADMIN'],
    requires: ['anomalies.read'],
    mockCount: 35,
    fields: [
      { key: 'subject', header: 'Sujet', type: 'text', filterable: true },
      { key: 'severity', header: 'Niveau', type: 'status', options: STATUS_RISK, filterable: true, groupable: true },
      { key: 'detected_at', header: 'Détecté le', type: 'date' },
    ],
  },
  {
    id: 'risks',
    title: 'Scores de risque',
    description: 'Scoring par marketeur, transporteur et livreur.',
    icon: FileWarning,
    scope: ['SUPERADMIN', 'ADMIN', 'SUPERVISOR'],
    requires: ['risks.read'],
    mockCount: 26,
    fields: [
      { key: 'entity', header: 'Entité', type: 'text', filterable: true },
      { key: 'entity_type', header: 'Type', type: 'badge', options: TYPE_ORG, filterable: true, groupable: true },
      { key: 'score', header: 'Score', type: 'number' },
      { key: 'level', header: 'Niveau', type: 'status', options: STATUS_RISK, filterable: true },
      { key: 'computed_at', header: 'Calculé le', type: 'date' },
    ],
  },
  {
    id: 'custom-roles',
    title: 'Rôles personnalisés',
    description: 'Gestion des rôles et permissions personnalisés.',
    icon: UserCog,
    scope: ['SUPERADMIN'],
    requires: ['custom-roles.manage'],
    mockCount: 15,
    fields: [
      { key: 'name', header: 'Rôle', type: 'text', filterable: true },
      { key: 'permission_count', header: 'Permissions', type: 'number' },
      { key: 'user_count', header: 'Utilisateurs', type: 'number' },
      { key: 'created_at', header: 'Créé le', type: 'date' },
    ],
  },
  {
    id: 'settings',
    title: 'Paramètres',
    description: 'Paramètres généraux du système et seuils opérationnels.',
    icon: Gauge,
    scope: ['SUPERADMIN'],
    requires: ['settings.read'],
    mockCount: 18,
    fields: [
      { key: 'setting_key', header: 'Clé', type: 'text', filterable: true },
      { key: 'setting_value', header: 'Valeur', type: 'text' },
      { key: 'category', header: 'Catégorie', type: 'text', filterable: true, groupable: true },
      { key: 'updated_at', header: 'Modifié le', type: 'date' },
    ],
  },
  {
    id: 'system-health',
    title: 'Santé du système',
    description: 'État des services, bases et files événementielles.',
    icon: ServerCog,
    scope: ['SUPERADMIN', 'SUPERVISOR'],
    requires: ['system-health.read'],
    mockCount: 14,
    fields: [
      { key: 'service', header: 'Service', type: 'text', filterable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_SYNC, filterable: true, groupable: true },
      { key: 'latency_ms', header: 'Latence', type: 'number' },
      { key: 'checked_at', header: 'Vérifié le', type: 'date' },
    ],
  },
  {
    id: 'notification-rules',
    title: 'Règles de notification',
    description: 'Routing anomalies → groupes de notification.',
    icon: ScrollText,
    scope: ['SUPERADMIN'],
    requires: ['notification-rules.write'],
    mockCount: 19,
    fields: [
      { key: 'name', header: 'Règle', type: 'text', filterable: true },
      { key: 'anomaly_type', header: 'Type', type: 'text', filterable: true },
      { key: 'min_severity', header: 'Sévérité', type: 'status', options: STATUS_RISK, filterable: true },
      { key: 'is_active', header: 'Actif', type: 'badge', options: [
        { label: 'Oui', value: 'true' },
        { label: 'Non', value: 'false' },
      ], filterable: true },
    ],
  },
  {
    id: 'audit-logs',
    title: "Journal d'audit",
    description: 'Traçabilité des actions utilisateurs.',
    icon: ScrollText,
    scope: ['SUPERADMIN', 'ADMIN', 'SUPERVISOR'],
    requires: ['audit-logs.read'],
    mockCount: 50,
    fields: [
      { key: 'action', header: 'Action', type: 'text', filterable: true },
      { key: 'user_name', header: 'Utilisateur', type: 'text', filterable: true },
      { key: 'resource_table', header: 'Ressource', type: 'text', filterable: true, groupable: true },
      { key: 'created_at', header: 'Horodatage', type: 'date' },
    ],
  },
  {
    id: 'reports',
    title: 'Rapports & exports',
    description: 'Rapports opérationnels, conformité et financiers.',
    icon: FileWarning,
    scope: ['SUPERADMIN', 'ADMIN', 'MARKETEUR', 'TRANSPORTEUR'],
    requires: ['reports.read'],
    mockCount: 25,
    fields: [
      { key: 'name', header: 'Rapport', type: 'text', filterable: true },
      { key: 'format', header: 'Format', type: 'badge', options: [
        { label: 'PDF', value: 'PDF' },
        { label: 'Excel', value: 'EXCEL' },
        { label: 'CSV', value: 'CSV' },
        { label: 'JSON', value: 'JSON' },
      ], filterable: true, groupable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true },
      { key: 'generated_at', header: 'Généré le', type: 'date' },
    ],
  },

  /* ===== ADMIN scope ===== */
  {
    id: 'admin-marketeurs',
    title: 'Marketeurs',
    description: 'Suivi des marketeurs par l\'administration CSPH.',
    icon: Building2,
    scope: ['ADMIN'],
    requires: ['markets.read'],
    mockCount: 28,
    fields: [
      { key: 'name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'quota', header: 'Quota (kg)', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true, groupable: true },
      { key: 'submitted_at', header: 'Soumis le', type: 'date' },
    ],
  },

  /* ===== SUPERVISOR scope ===== */
  {
    id: 'infra',
    title: 'Dashboards infra (Grafana)',
    description: '8 dashboards dédiés — Prometheus, CPU, mémoire, réseau.',
    icon: ServerCog,
    scope: ['SUPERVISOR'],
    requires: ['metrics.read'],
    mockCount: 22,
    fields: [
      { key: 'dashboard', header: 'Dashboard', type: 'text', filterable: true },
      { key: 'health', header: 'Santé', type: 'status', options: STATUS_SYNC, filterable: true, groupable: true },
      { key: 'cpu_percent', header: 'CPU %', type: 'number' },
      { key: 'checked_at', header: 'Vérifié le', type: 'date' },
    ],
  },
  {
    id: 'logs',
    title: 'Logs centralisés',
    description: 'Traçabilité technique et corrélation de requêtes.',
    icon: Activity,
    scope: ['SUPERVISOR'],
    requires: ['audit-logs.read'],
    mockCount: 45,
    fields: [
      { key: 'service', header: 'Service', type: 'text', filterable: true },
      { key: 'level', header: 'Niveau', type: 'status', options: STATUS_CHECK, filterable: true, groupable: true },
      { key: 'message', header: 'Message', type: 'text' },
      { key: 'created_at', header: 'Horodatage', type: 'date' },
    ],
  },
  {
    id: 'alerts',
    title: 'Alertes infrastructure',
    description: 'Alertes techniques routées vers le SUPERVISOR.',
    icon: AlertTriangle,
    scope: ['SUPERVISOR'],
    requires: ['alerts.read'],
    mockCount: 30,
    fields: [
      { key: 'title', header: 'Alerte', type: 'text', filterable: true },
      { key: 'severity', header: 'Sévérité', type: 'status', options: STATUS_RISK, filterable: true, groupable: true },
      { key: 'raised_at', header: 'Déclenchée le', type: 'date' },
    ],
  },
  {
    id: 'alert-rules',
    title: 'Règles d\'alerte',
    description: 'Paramétrage des seuils et conditions.',
    icon: Gauge,
    scope: ['ADMIN'],
    requires: ['alerts.write'],
    mockCount: 18,
    fields: [
      { key: 'name', header: 'Règle', type: 'text', filterable: true },
      { key: 'severity', header: 'Sévérité', type: 'status', options: STATUS_RISK, filterable: true, groupable: true },
      { key: 'updated_at', header: 'Modifié le', type: 'date' },
    ],
  },

  /* ===== INTEGRATEUR scope ===== */
  {
    id: 'pda',
    title: 'PDA + GPS + RFID',
    description: 'Parc de terminaux PDA et modules IoT.',
    icon: Layers,
    scope: ['INTEGRATEUR'],
    requires: ['pda.read'],
    mockCount: 32,
    fields: [
      { key: 'serial_number', header: 'N° série', type: 'text', filterable: true },
      { key: 'device_type', header: 'Type', type: 'badge', options: TYPE_DEVICE, filterable: true, groupable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_SYNC, filterable: true },
      { key: 'activated_at', header: 'Activé le', type: 'date' },
    ],
  },
  {
    id: 'auth',
    title: 'Authentification',
    description: 'Activation et authentification des appareils.',
    icon: UserCog,
    scope: ['INTEGRATEUR'],
    requires: ['integrations.read'],
    mockCount: 20,
    fields: [
      { key: 'device_name', header: 'Appareil', type: 'text', filterable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true },
      { key: 'enrolled_at', header: 'Enrôlé le', type: 'date' },
    ],
  },
  {
    id: 'fleet-iot',
    title: 'Parc équipements',
    description: 'Maintenance matériel PDA, GPS, RFID.',
    icon: Truck,
    scope: ['INTEGRATEUR'],
    requires: ['devices.read'],
    mockCount: 30,
    fields: [
      { key: 'asset_name', header: 'Équipement', type: 'text', filterable: true },
      { key: 'status', header: 'État', type: 'status', options: STATUS_SYNC, filterable: true, groupable: true },
      { key: 'last_seen_at', header: 'Vu le', type: 'date' },
    ],
  },

  /* ===== AGENT scope ===== */
  {
    id: 'agent-marketeurs',
    title: 'Marketeurs',
    description: 'Vue consolidée des marketeurs assignés.',
    icon: Building2,
    scope: ['AGENT'],
    requires: ['markets.read'],
    mockCount: 24,
    fields: [
      { key: 'name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'quota', header: 'Quota (kg)', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true, groupable: true },
      { key: 'submitted_at', header: 'Soumis le', type: 'date' },
    ],
  },
  {
    id: 'visits',
    title: 'Rapports de visite',
    description: 'Comptes-rendus de visite terrain.',
    icon: ScrollText,
    scope: ['AGENT'],
    requires: ['tours.read'],
    mockCount: 22,
    fields: [
      { key: 'marketeur_name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'agent_name', header: 'Agent', type: 'text' },
      { key: 'visit_at', header: 'Visite le', type: 'date' },
    ],
  },
  {
    id: 'passwords',
    title: 'Réinitialisation mots de passe',
    description: 'Reset des mots de passe marketeurs et chauffeurs.',
    icon: UserCog,
    scope: ['AGENT'],
    requires: ['users.reset'],
    mockCount: 18,
    fields: [
      { key: 'user_name', header: 'Utilisateur', type: 'text', filterable: true },
      { key: 'system_role', header: 'Rôle', type: 'badge', options: TYPE_ORG, filterable: true, groupable: true },
      { key: 'reset_at', header: 'Réinitialisé le', type: 'date' },
    ],
  },
  {
    id: 'anomalies-investigation',
    title: 'Anomalies à investiguer',
    description: 'Alertes métier routées vers les AGENT (piste investigation).',
    icon: AlertTriangle,
    scope: ['AGENT'],
    requires: ['anomalies.investigate'],
    mockCount: 26,
    fields: [
      { key: 'subject', header: 'Sujet', type: 'text', filterable: true },
      { key: 'severity', header: 'Sévérité', type: 'status', options: STATUS_VIOLATION, filterable: true, groupable: true },
      { key: 'raised_at', header: 'Déclenchée le', type: 'date' },
    ],
  },

  /* ===== MARKETEUR scope ===== */
  {
    id: 'marketeur-vehicles',
    title: 'Camions & chauffeurs',
    description: 'État de la flotte et affectation des chauffeurs.',
    icon: Truck,
    scope: ['MARKETEUR'],
    requires: ['trucks.read'],
    mockCount: 30,
    fields: [
      { key: 'license_plate', header: 'Immatriculation', type: 'text', filterable: true },
      { key: 'driver_name', header: 'Chauffeur', type: 'text' },
      { key: 'max_volume', header: 'Capacité (kg)', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: [
        { label: 'Disponible', value: 'AVAILABLE' },
        { label: 'En tournée', value: 'INPROGRESS' },
        { label: 'Maintenance', value: 'MAINTENANCE' },
      ], filterable: true, groupable: true },
      { key: 'updated_at', header: 'Modifié le', type: 'date' },
    ],
  },
  {
    id: 'quotas',
    title: 'Quotas & volumes',
    description: 'Quotas alloués et volumes commercialisés.',
    icon: Gauge,
    scope: ['MARKETEUR'],
    requires: ['quotas.read'],
    mockCount: 20,
    fields: [
      { key: 'period', header: 'Période', type: 'text', filterable: true },
      { key: 'allocated', header: 'Alloué (kg)', type: 'number' },
      { key: 'sold', header: 'Vendu (kg)', type: 'number' },
      { key: 'remaining', header: 'Reste (kg)', type: 'number' },
    ],
  },
  {
    id: 'supply',
    title: "Requêtes d'enlèvement",
    description: "Flux d'approvisionnement en vrac (Gaz Vrac).",
    icon: PackageCheck,
    scope: ['MARKETEUR'],
    requires: ['pickups.create'],
    mockCount: 28,
    fields: [
      { key: 'reference', header: 'Référence', type: 'text', filterable: true },
      { key: 'source_name', header: 'Source', type: 'text', filterable: true },
      { key: 'requested_quantity', header: 'Quantité (kg)', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_SHIP, filterable: true, groupable: true },
      { key: 'requested_at', header: 'Demandée le', type: 'date' },
    ],
  },
  {
    id: 'marketeur-delivery-tours',
    title: 'Tournées de livraison',
    description: 'Tournées de bouteilles 50 kg et vrac vers clients.',
    icon: Route,
    scope: ['MARKETEUR'],
    requires: ['tours.read'],
    mockCount: 32,
    fields: [
      { key: 'reference', header: 'Tournée', type: 'text', filterable: true },
      { key: 'driver_name', header: 'Chauffeur', type: 'text' },
      { key: 'checkpoint_count', header: 'Checkpoints', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_TOUR, filterable: true, groupable: true },
      { key: 'planned_date', header: 'Date', type: 'date' },
    ],
  },
  {
    id: 'marketeur-clients',
    title: 'Clients & livraisons',
    description: 'Historique des livraisons par client.',
    icon: Building2,
    scope: ['MARKETEUR'],
    requires: ['markets.read'],
    mockCount: 35,
    fields: [
      { key: 'name', header: 'Client', type: 'text', filterable: true },
      { key: 'city', header: 'Ville', type: 'text', filterable: true },
      { key: 'order_count', header: 'Commandes', type: 'number' },
      { key: 'last_order_at', header: 'Dernière commande', type: 'date' },
    ],
  },
  {
    id: 'performance',
    title: 'Performance chauffeurs',
    description: 'Indicateurs de performance des chauffeurs/livreurs.',
    icon: TrendingUp,
    scope: ['MARKETEUR', 'TRANSPORTEUR'],
    requires: ['reports.read'],
    mockCount: 24,
    fields: [
      { key: 'driver_name', header: 'Chauffeur', type: 'text', filterable: true },
      { key: 'tour_count', header: 'Tournées', type: 'number' },
      { key: 'on_time_pct', header: 'À l\'heure %', type: 'number' },
      { key: 'rating', header: 'Note', type: 'number' },
    ],
  },

  /* ===== TRANSPORTEUR scope ===== */
  {
    id: 'tours-pending',
    title: "Tournées en attente d'accusé",
    description: 'Tournées EXTERNAL en PENDINGTRANSPORTERACK.',
    icon: PackageCheck,
    scope: ['TRANSPORTEUR'],
    requires: ['tours.read'],
    mockCount: 3,
    fields: [
      { key: 'reference', header: 'Tournée', type: 'text', filterable: true },
      { key: 'marketeur_name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'type', header: 'Type', type: 'badge', options: TYPE_VEHICLE, filterable: true, groupable: true },
      { key: 'driver_name', header: 'Chauffeur', type: 'text' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_TOUR, filterable: true, groupable: true },
      { key: 'created_at', header: 'Créée le', type: 'date' },
    ],
  },
  {
    id: 'tours-active',
    title: 'Tournées actives',
    description: 'Tournées ACKNOWLEDGED ou INPROGRESS.',
    icon: Route,
    scope: ['TRANSPORTEUR'],
    requires: ['tours.read'],
    mockCount: 5,
    fields: [
      { key: 'reference', header: 'Tournée', type: 'text', filterable: true },
      { key: 'client_name', header: 'Client', type: 'text', filterable: true },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_TOUR, filterable: true, groupable: true },
      { key: 'progress_pct', header: 'Avancement', type: 'number' },
      { key: 'started_at', header: 'Début', type: 'date' },
    ],
  },
  {
    id: 'tours-history',
    title: 'Historique des tournées',
    description: 'Tournées clôturées.',
    icon: ScrollText,
    scope: ['TRANSPORTEUR'],
    requires: ['tours.read'],
    mockCount: 40,
    fields: [
      { key: 'reference', header: 'Tournée', type: 'text', filterable: true },
      { key: 'delivered_quantity', header: 'Livré (TM)', type: 'number' },
      { key: 'bottle_count', header: 'Bouteilles', type: 'number' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_TOUR, filterable: true, groupable: true },
      { key: 'closed_at', header: 'Clôturée le', type: 'date' },
    ],
  },
  {
    id: 'transporter-vehicles',
    title: 'Camions',
    description: 'Parc camions du transporteur et certificats.',
    icon: Truck,
    scope: ['TRANSPORTEUR'],
    requires: ['trucks.read'],
    mockCount: 18,
    fields: [
      { key: 'license_plate', header: 'Immatriculation', type: 'text', filterable: true },
      { key: 'type', header: 'Type', type: 'badge', options: TYPE_VEHICLE, filterable: true, groupable: true },
      { key: 'driver_name', header: 'Chauffeur', type: 'text' },
      { key: 'status', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true, groupable: true },
      { key: 'certificate_expiry_at', header: 'Certificat expire le', type: 'date' },
    ],
  },
  {
    id: 'transporter-drivers',
    title: 'Chauffeurs',
    description: 'Chauffeurs rattachés au transporteur.',
    icon: IdCard,
    scope: ['TRANSPORTEUR'],
    requires: ['drivers.read'],
    mockCount: 24,
    fields: [
      { key: 'full_name', header: 'Chauffeur', type: 'text', filterable: true },
      { key: 'license_number', header: 'Permis', type: 'text' },
      { key: 'license_expiry', header: 'Permis expire le', type: 'date' },
      { key: 'is_active', header: 'Actif', type: 'badge', options: [
        { label: 'Actif', value: 'true' },
        { label: 'Inactif', value: 'false' },
      ], filterable: true, groupable: true },
    ],
  },
  {
    id: 'contracts',
    title: 'Mes contrats',
    description: 'Accord de prestation avec les marketeurs.',
    icon: ScrollText,
    scope: ['TRANSPORTEUR'],
    requires: ['transporters.read'],
    mockCount: 6,
    fields: [
      { key: 'contract_reference', header: 'Référence', type: 'text', filterable: true },
      { key: 'marketeur_name', header: 'Marketeur', type: 'text', filterable: true },
      { key: 'period', header: 'Période', type: 'text' },
      { key: 'is_primary', header: 'Principal', type: 'badge', options: [
        { label: 'Oui', value: 'true' },
        { label: 'Non', value: 'false' },
      ], filterable: true, groupable: true },
      { key: 'is_active', header: 'Statut', type: 'status', options: STATUS_ACTIVE_BADGE, filterable: true, groupable: true },
    ],
  },
] as const

/* --------------------------------------------------------------------------
 * REGISTRY PROJECTION
 *
 * Build the legacy `Record<\`${Role}:${module}\`, ModuleDefinition>` map on
 * demand. Consumers that need a per-role list of generic modules call
 * `modulesForRole(role)`; the legacy `MODULE_REGISTRY` is still exported as
 * a backwards-compatible alias that aggregates everything visible to any
 * web role (so the role switcher's generic module route keeps working).
 * --------------------------------------------------------------------------*/

function visibleForRole(role: Role): boolean {
  return (modulesForRole(role).length > 0)
}

export function modulesForRole(role: Role): ModuleDecl[] {
  return MODULE_CATALOG.filter(
    (m) => m.scope.includes(role) && m.requires.some((c) => hasPermission(role, c))
  )
}

function buildRegistry() {
  const roles: readonly Role[] = ['SUPERADMIN', 'ADMIN', 'SUPERVISOR', 'INTEGRATEUR', 'AGENT', 'MARKETEUR', 'TRANSPORTEUR']
  const out: ModuleRegistry = {}
  for (const role of roles) {
    if (!visibleForRole(role)) continue
    for (const module of modulesForRole(role)) {
      out[`${role}:${module.id}`] = module
    }
  }
  return out
}

/** Aggregated registry of (role, module) → module — visible to any web role. */
export const MODULE_REGISTRY: ModuleRegistry = buildRegistry()

/** Convenience: registry lookup that uses snake_case paths. */
export function getModule(role: Role, id: string): ModuleDecl | undefined {
  return modulesForRole(role).find((m) => m.id === id)
}