import { getRouteApi } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCallback, useState } from 'react'
import { OrganizationsTable } from './components/organizations-table'
import { OrganizationDetailsSheet } from './components/organization-details-sheet'
import { getOrganizations } from './data/organizations'
import type { Organization } from './data/organizations'

const route = getRouteApi('/_authenticated/organizations/')

export function OrganizationsPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [detailsOrg, setDetailsOrg] = useState<Organization | null>(null)
  const orgs = getOrganizations()

  const handleViewDetails = useCallback((org: Organization) => {
    setDetailsOrg(org)
  }, [])

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Building2 className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight'>Organizations</h1>
          <Badge variant='outline' className='ml-auto'>
            {orgs.length}
          </Badge>
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <OrganizationsTable
          data={orgs}
          search={search}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />
      </section>

      <OrganizationDetailsSheet
        org={detailsOrg}
        open={detailsOrg !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsOrg(null)
        }}
      />
    </main>
  )
}