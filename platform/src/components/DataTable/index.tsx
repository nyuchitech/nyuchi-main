/**
 * DataTable Component
 * Notion-style data table with multiple views
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Search, Plus, List, LayoutGrid, Columns, Filter, Download } from 'lucide-react'
import { DataTableProps, ViewType, CellValue } from './types'
import { TableView } from './TableView'
import { KanbanView } from './KanbanView'
import { CardView } from './CardView'

export function DataTable<T extends { id: string }>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    onCreate,
    loading,
    searchable = true,
    emptyMessage = 'No data available',
    emptyAction,
  } = props

  const [view, setView] = useState<ViewType>('table')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter data based on search
  const filteredData = search
    ? data.filter((item) =>
        columns.some((column) => {
          const value = column.getValue ? column.getValue(item) : (item as Record<string, CellValue>)[column.id]
          return value && value.toString().toLowerCase().includes(search.toLowerCase())
        })
      )
    : data

  const renderView = () => {
    if (loading) {
      return (
        <div className="p-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )
    }

    if (filteredData.length === 0) {
      return (
        <div className="p-16 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-4">
            {search ? 'No results found' : emptyMessage}
          </h3>
          {!search && emptyAction && (
            <Button onClick={emptyAction.onClick}>
              <Plus className="w-4 h-4 mr-2" />
              {emptyAction.label}
            </Button>
          )}
        </div>
      )
    }

    switch (view) {
      case 'kanban':
        return <KanbanView {...props} data={filteredData} groupByColumn="status" />
      case 'cards':
        return <CardView {...props} data={filteredData} />
      default:
        return (
          <TableView
            {...props}
            data={filteredData}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
          />
        )
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b flex-wrap">
        {/* Search */}
        {searchable && (
          <div className="relative min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        <div className="flex-1" />

        {/* View Switcher */}
        <TooltipProvider>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => value && setView(value as ViewType)}
            size="sm"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="table" aria-label="Table View">
                  <List className="w-4 h-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Table View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="kanban" aria-label="Kanban View">
                  <Columns className="w-4 h-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Kanban View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="cards" aria-label="Card View">
                  <LayoutGrid className="w-4 h-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Card View</TooltipContent>
            </Tooltip>
          </ToggleGroup>

          {/* Actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Filter className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Filter</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {onCreate && (
          <Button size="sm" onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        )}
      </div>

      {/* Selected Items Bar */}
      {selectedIds.length > 0 && view === 'table' && (
        <div className="px-4 py-2 bg-muted flex items-center gap-4">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Clear
          </Button>
          <div className="flex-1" />
          <Button variant="destructive" size="sm">
            Delete Selected
          </Button>
        </div>
      )}

      {/* View Content */}
      <div className="min-h-[400px]">{renderView()}</div>
    </Card>
  )
}

export * from './types'
