import { getRouteApi } from '@tanstack/react-router'
import { Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCallback, useState } from 'react'
import { LivreursTable } from './components/livreurs-table'
import { LivreurDetailsSheet } from './components/livreur-details-sheet'
import { getLivreurs } from './data/livreurs'
import type { LivreurView } from './data/livreurs'

const route = getRouteApi('/_authenticated/livreurs/')

export function LivreursPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [detailsLivreur, setDetailsLivreur] = useState<LivreurView | null>(null)
  const livreurs = getLivreurs()

  const handleViewDetails = useCallback((livreur: LivreurView) => {
    setDetailsLivreur(livreur)
  }, [])

  return (
    <main
      id='main-content'
      className='flex-1 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'
    >
      <section className='rounded-2xl border-transparent bg-background/88 p-3 shadow-sm backdrop-blur-sm sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Truck className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight'>Livreurs</h1>
          <Badge variant='outline' className='ml-auto'>
            {livreurs.length}
          </Badge>
        </div>
      </section>

      <section className='space-y-4 rounded-xl border-transparent bg-background/92 p-4 shadow-sm'>
        <LivreursTable
          data={livreurs}
          search={search}
          navigate={navigate}
          onViewDetails={handleViewDetails}
        />
      </section>

      <LivreurDetailsSheet
        livreur={detailsLivreur}
        open={detailsLivreur !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsLivreur(null)
        }}
      />
    </main>
  )
}