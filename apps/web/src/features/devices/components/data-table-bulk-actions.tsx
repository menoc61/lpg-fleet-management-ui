import { type Table } from '@tanstack/react-table'
import { Download, Power, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type DeviceView } from '../data/devices'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selected = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as DeviceView)

  const runBulkAction = (label: string, doneLabel: string) => {
    toast.promise(sleep(900), {
      loading: `${label}...`,
      success: () => {
        table.resetRowSelection()
        return `${doneLabel} (${selected.length})`
      },
      error: 'Action impossible',
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='appareil'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => runBulkAction('Preparation export', 'Export pret')}
            className='size-8'
            aria-label='Exporter les appareils selectionnes'
            title='Exporter les appareils selectionnes'
          >
            <Download />
            <span className='sr-only'>Exporter les appareils selectionnes</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exporter les appareils selectionnes</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() =>
              runBulkAction('Synchronisation', 'Synchronisation declenchee')
            }
            className='size-8'
            aria-label='Forcer la synchronisation'
            title='Forcer la synchronisation'
          >
            <RotateCcw />
            <span className='sr-only'>Forcer la synchronisation</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Forcer la synchronisation</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() =>
              runBulkAction(
                'Changement de statut',
                'Statut mis a jour'
              )
            }
            className='size-8'
            aria-label='Activer ou mettre en maintenance'
            title='Activer ou mettre en maintenance'
          >
            <Power />
            <span className='sr-only'>Activer ou mettre en maintenance</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Activer ou mettre en maintenance</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}