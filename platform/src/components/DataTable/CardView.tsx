/**
 * Card View
 * Grid layout with cards
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Pencil } from 'lucide-react'
import { DataTableProps, CellValue } from './types'

type CardViewProps<T> = DataTableProps<T>

export function CardView<T extends { id: string }>({
  data,
  columns,
  onDelete,
}: CardViewProps<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {data.map((item) => (
        <Card key={item.id} className="flex flex-col h-full transition-shadow hover:shadow-lg">
          <CardContent className="flex-1 p-4">
            {columns.slice(0, 5).map((column, index) => {
              const value = column.getValue ? column.getValue(item) : (item as Record<string, CellValue>)[column.id]

              if (!value) return null

              return (
                <div key={column.id} className={index < 4 ? 'mb-3' : ''}>
                  {index === 0 ? (
                    <h3 className="font-semibold text-base mb-2">{value}</h3>
                  ) : (
                    <>
                      <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">
                        {column.label}
                      </span>
                      {column.type === 'select' ? (
                        <Badge variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ) : column.type === 'multiselect' && Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1">
                          {value.map((v) => (
                            <Badge key={v} variant="secondary" className="text-xs">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">
                          {column.type === 'date' && typeof value === 'string'
                            ? new Date(value).toLocaleDateString()
                            : column.type === 'url' && typeof value === 'string' ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {value}
                              </a>
                            ) : column.type === 'email' && typeof value === 'string' ? (
                              <a href={`mailto:${value}`} className="text-primary hover:underline">
                                {value}
                              </a>
                            ) : (
                              String(value)
                            )}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </CardContent>
          <div className="flex justify-end gap-1 px-4 pb-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="w-4 h-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
