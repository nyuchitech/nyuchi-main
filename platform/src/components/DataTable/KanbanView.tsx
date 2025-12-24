/**
 * Kanban View
 * Notion-style kanban board
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Pencil } from 'lucide-react'
import { DataTableProps, CellValue } from './types'

interface KanbanViewProps<T> extends DataTableProps<T> {
  groupByColumn: string
}

const groupColors = [
  'border-l-primary',
  'border-l-[var(--zimbabwe-green)]',
  'border-l-[var(--zimbabwe-yellow)]',
  'border-l-foreground',
]

export function KanbanView<T extends { id: string }>({
  data,
  columns,
  onUpdate: _onUpdate,
  onDelete,
  groupByColumn,
}: KanbanViewProps<T>) {
  const groupColumn = columns.find((col) => col.id === groupByColumn)

  if (!groupColumn || groupColumn.type !== 'select') {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          Kanban view requires a select column for grouping
        </p>
      </div>
    )
  }

  const groups = groupColumn.options || []
  const groupedData = groups.map((group) => ({
    group,
    items: data.filter((item) => {
      const value = groupColumn.getValue ? groupColumn.getValue(item) : (item as Record<string, CellValue>)[groupByColumn]
      return value === group
    }),
  }))

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 p-4">
      {groupedData.map((group, groupIndex) => (
        <div key={group.group} className="min-w-[300px] flex-shrink-0">
          {/* Column Header */}
          <div className={`p-3 mb-3 bg-muted rounded-lg border-l-4 ${groupColors[groupIndex % groupColors.length]}`}>
            <h4 className="font-semibold text-sm">{group.group}</h4>
            <p className="text-xs text-muted-foreground">
              {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-3">
            {group.items.map((item) => (
              <Card
                key={item.id}
                className={`transition-all hover:shadow-md hover:${groupColors[groupIndex % groupColors.length].replace('border-l-', 'border-')}`}
              >
                <CardContent className="p-4">
                  {columns
                    .filter((col) => col.id !== groupByColumn)
                    .slice(0, 4)
                    .map((column) => {
                      const value = column.getValue ? column.getValue(item) : (item as Record<string, CellValue>)[column.id]

                      if (!value) return null

                      return (
                        <div key={column.id} className="mb-3 last:mb-0">
                          <span className="text-xs text-muted-foreground block mb-1">
                            {column.label}
                          </span>
                          {column.type === 'select' || column.type === 'multiselect' ? (
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(value) ? (
                                value.map((v) => (
                                  <Badge key={v} variant="secondary" className="text-xs">
                                    {v}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  {String(value)}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <p className={`text-sm ${column.id === columns[0].id ? 'font-semibold' : ''}`}>
                              {column.type === 'date' && typeof value === 'string'
                                ? new Date(value).toLocaleDateString()
                                : String(value)}
                            </p>
                          )}
                        </div>
                      )
                    })}

                  <div className="flex justify-end gap-1 mt-3 pt-2 border-t">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {group.items.length === 0 && (
              <div className="p-6 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                <p className="text-sm">No items</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
