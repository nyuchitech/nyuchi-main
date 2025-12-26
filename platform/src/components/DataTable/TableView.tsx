/**
 * Table View
 * Notion-style table with inline editing
 */

'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, GripVertical } from 'lucide-react'
import { DataTableProps, CellValue } from './types'
import { EditableCell } from './EditableCell'

interface TableViewProps<T> extends DataTableProps<T> {
  selectedIds: string[]
  onSelect: (ids: string[]) => void
}

export function TableView<T extends { id: string }>({
  data,
  columns,
  onUpdate,
  onDelete,
  selectedIds,
  onSelect,
}: TableViewProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelect(data.map((row) => row.id))
    } else {
      onSelect([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelect([...selectedIds, id])
    } else {
      onSelect(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const handleCellUpdate = async (rowId: string, columnId: string, value: CellValue) => {
    if (onUpdate) {
      await onUpdate(rowId, columnId, value)
    }
  }

  const isAllSelected = selectedIds.length === data.length && data.length > 0
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.length

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isIndeterminate
                }
              }}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          {columns.map((column) => (
            <TableHead
              key={column.id}
              style={{ width: column.width, minWidth: column.width ? undefined : 150 }}
              className="font-semibold"
            >
              {column.label}
            </TableHead>
          ))}
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id} className="group">
            <TableCell className="py-0">
              <div className="flex items-center gap-1">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab p-1">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </button>
                <Checkbox
                  checked={selectedIds.includes(row.id)}
                  onCheckedChange={(checked) => handleSelectRow(row.id, !!checked)}
                />
              </div>
            </TableCell>
            {columns.map((column) => {
              const value = column.getValue ? column.getValue(row) : (row as Record<string, CellValue>)[column.id]
              return (
                <TableCell key={column.id} className="py-0">
                  <EditableCell
                    value={value}
                    column={column}
                    rowId={row.id}
                    onSave={(newValue) => handleCellUpdate(row.id, column.id, newValue)}
                  />
                </TableCell>
              )
            })}
            <TableCell className="text-right">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(row.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
