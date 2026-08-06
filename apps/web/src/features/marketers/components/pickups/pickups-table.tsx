import { useState } from 'react'
import { DataTable } from '@lpg/ui'
import type { PickupRequest } from '@lpg/types'
import { pickupsColumns } from './pickups-columns'

interface PickupsTableProps {
  data: (PickupRequest & { source_site?: any; destination_site?: any })[]
  search?: string
  onViewDetails: (pickup: PickupRequest & { source_site?: any; destination_site?: any }) => void
}

export function PickupsTable({ data, onViewDetails }: PickupsTableProps) {
  const [columns] = useState(() => pickupsColumns(onViewDetails))

  return (
    <DataTable
      data={data}
      columns={columns}
      search={{ placeholder: 'Rechercher un enlèvement…', searchKey: 'q' }}
    />
  )
}