import { useMemo } from 'react'
import { FileBarChart } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { KpiTile, PageShell, SectionCard } from '@/components/layout/page'
import { DeclarationsTable } from './components/declarations-table'
import { getDeclarations, getDeclarationSummary } from './data/declarations'
import { getScope } from '@/features/scope/scope'
import { useAuthStore } from '@/store/auth-store'

export function DeclarationsPage() {
  const rows = useMemo(() => getDeclarations(getScope(useAuthStore.getState().user)), [])
  const summary = useMemo(() => getDeclarationSummary(rows), [rows])

  return (
    <PageShell>
      <PageHeader
        title='Déclarations'
        description='Déclarations mensuelles des marketeurs, du brouillon à la réconciliation.'
      />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <KpiTile label='Total' value={String(summary.total)} icon={<FileBarChart className='size-4 text-primary' />} />
        <KpiTile label='Soumises' value={String(summary.submitted)} />
        <KpiTile label='Réconciliées' value={String(summary.reconciled)} />
        <KpiTile label='Contestées' value={String(summary.disputed)} />
      </div>
      <SectionCard>
        <DeclarationsTable rows={rows} />
      </SectionCard>
    </PageShell>
  )
}