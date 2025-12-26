/**
 * Editable Cell
 * Inline editing for table cells
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X } from 'lucide-react'
import { Column, CellValue } from './types'

interface EditableCellProps {
  value: CellValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<any>
  onSave: (value: CellValue) => Promise<void>
  rowId: string
}

export function EditableCell({ value, column, onSave, rowId: _rowId }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch {
      setEditValue(value)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!column.editable) {
    return <div className="py-2">{renderValue(value, column)}</div>
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 py-1">
        {renderEditControl()}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSave}
          disabled={saving}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCancel}
          disabled={saving}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="py-2 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
    >
      {renderValue(value, column)}
    </div>
  )

  function renderEditControl() {
    switch (column.type) {
      case 'select':
        return (
          <Select
            value={String(editValue || '')}
            onValueChange={(val) => setEditValue(val)}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <div className="flex flex-col gap-1 p-2 bg-background border rounded-md">
            {column.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={Array.isArray(editValue) && editValue.includes(option)}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(editValue) ? editValue : []
                    if (checked) {
                      setEditValue([...current, option])
                    } else {
                      setEditValue(current.filter((v) => v !== option))
                    }
                  }}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'date':
        return (
          <Input
            ref={inputRef}
            type="date"
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-8 w-auto"
          />
        )

      case 'number':
        return (
          <Input
            ref={inputRef}
            type="number"
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-8 w-24"
          />
        )

      default:
        return (
          <Input
            ref={inputRef}
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-8"
          />
        )
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderValue(value: CellValue, column: Column<any>) {
  if (column.render) {
    return column.render(value, {})
  }

  switch (column.type) {
    case 'select':
      return value ? (
        <Badge variant="secondary" className="text-xs">
          {value}
        </Badge>
      ) : (
        <span className="text-muted-foreground italic text-sm">Empty</span>
      )

    case 'multiselect':
      return Array.isArray(value) && value.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {value.map((val) => (
            <Badge key={val} variant="secondary" className="text-xs">
              {val}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic text-sm">Empty</span>
      )

    case 'date':
      return typeof value === 'string' ? (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )

    case 'url':
      return typeof value === 'string' ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      )

    case 'email':
      return typeof value === 'string' ? (
        <a href={`mailto:${value}`} className="text-sm text-primary hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      )

    default:
      return value != null ? (
        <span className="text-sm">{String(value)}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
  }
}
