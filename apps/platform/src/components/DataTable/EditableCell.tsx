/**
 * 🇿🇼 Nyuchi Platform - Editable Cell
 * Inline editing for table cells
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Box,
  Chip,
  IconButton,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { Column, CellValue } from './types';

interface EditableCellProps {
  value: CellValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<any>;
  onSave: (value: CellValue) => Promise<void>;
  rowId: string;
}

export function EditableCell({ value, column, onSave, rowId: _rowId }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch {
      setEditValue(value);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!column.editable) {
    return <Box sx={{ py: 1 }}>{renderValue(value, column)}</Box>;
  }

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.5 }}>
        {renderEditControl()}
        <IconButton
          size="small"
          onClick={handleSave}
          disabled={saving}
          sx={{ p: 0.5 }}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleCancel}
          disabled={saving}
          sx={{ p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      onClick={() => setIsEditing(true)}
      sx={{
        py: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
          borderRadius: 1,
        },
      }}
    >
      {renderValue(value, column)}
    </Box>
  );

  function renderEditControl() {
    switch (column.type) {
      case 'select':
        return (
          <Select
            size="small"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ minWidth: 120 }}
            autoFocus
          >
            {column.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );

      case 'multiselect':
        return (
          <Select
            size="small"
            multiple
            value={Array.isArray(editValue) ? editValue : []}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ minWidth: 200 }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((val) => (
                  <Chip key={val} label={val} size="small" />
                ))}
              </Box>
            )}
          >
            {column.options?.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={Array.isArray(editValue) && editValue.includes(option)} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
        );

      case 'date':
        return (
          <TextField
            inputRef={inputRef}
            size="small"
            type="date"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
          />
        );

      case 'number':
        return (
          <TextField
            inputRef={inputRef}
            size="small"
            type="number"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
          />
        );

      default:
        return (
          <TextField
            inputRef={inputRef}
            size="small"
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            fullWidth
          />
        );
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderValue(value: CellValue, column: Column<any>) {
  if (column.render) {
    return column.render(value, {});
  }

  switch (column.type) {
    case 'select':
      return value ? (
        <Chip label={value} size="small" />
      ) : (
        <Box sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Empty</Box>
      );

    case 'multiselect':
      return Array.isArray(value) && value.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value.map((val) => (
            <Chip key={val} label={val} size="small" />
          ))}
        </Box>
      ) : (
        <Box sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Empty</Box>
      );

    case 'date':
      return typeof value === 'string' ? new Date(value).toLocaleDateString() : '-';

    case 'url':
      return typeof value === 'string' ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
          {value}
        </a>
      ) : (
        '-'
      );

    case 'email':
      return typeof value === 'string' ? (
        <a href={`mailto:${value}`} style={{ color: 'inherit' }}>
          {value}
        </a>
      ) : (
        '-'
      );

    default:
      return value != null ? String(value) : '-';
  }
}
