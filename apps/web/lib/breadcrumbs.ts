export type Breadcrumb = { label: string; to: string }

const LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  vehicles: 'Véhicules',
  cylinders: 'Citernes',
  maintenance: 'Entretien',
  tracking: 'Suivi',
  drivers: 'Chauffeurs',
  reports: 'Rapports',
  settings: 'Paramètres',
  profile: 'Profil',
}

export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Breadcrumb[] = []
  let acc = ''
  for (const seg of segments) {
    acc += `/${seg}`
    crumbs.push({ label: LABELS[seg] ?? seg, to: acc })
  }
  return crumbs
}
