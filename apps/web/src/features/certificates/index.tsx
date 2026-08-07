import { getRouteApi } from '@tanstack/react-router'
import { FileCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCallback, useState } from 'react'
import { CertificatesTable } from './components/certificates-table'
import { CertificateDetailsSheet } from './components/certificate-details-sheet'
import { getCertificates } from './data/certificates'
import type { CertificateView } from './data/certificates'

const route = getRouteApi('/_authenticated/certificates/')

export function CertificatesPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [detailsCert, setDetailsCert] = useState<CertificateView | null>(null)
  const certificates = getCertificates()

  const handleViewDetails = useCallback((certificate: CertificateView) => {
    setDetailsCert(certificate)
  }, [])

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <FileCheck className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight'>Certificats</h1>
          <Badge variant='outline' className='ml-auto'>
            {certificates.length}
          </Badge>
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <CertificatesTable
          data={certificates}
          search={search}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />
      </section>

      <CertificateDetailsSheet
        certificate={detailsCert}
        open={detailsCert !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsCert(null)
        }}
      />
    </main>
  )
}