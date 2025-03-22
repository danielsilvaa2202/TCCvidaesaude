// components/data-table-toolbar.tsx

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Pesquisar por Razão Social...'
          value={(table.getColumn('razaoSocial')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('razaoSocial')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Limpar Filtros
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      {/* Se quiser manter algo como DataTableViewOptions, pode colocar aqui */}
    </div>
  )
}
