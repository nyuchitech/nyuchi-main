/**
 * 🇿🇼 Nyuchi Platform - Table View
 * Notion-style table with inline editing
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Checkbox,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { DataTableProps, CellValue } from './types';
import { EditableCell } from './EditableCell';

interface TableViewProps<T> extends DataTableProps<T> {
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
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
      onSelect(data.map((row) => row.id));
    } else {
      onSelect([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelect([...selectedIds, id]);
    } else {
      onSelect(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleCellUpdate = async (rowId: string, columnId: string, value: CellValue) => {
    if (onUpdate) {
      await onUpdate(rowId, columnId, value);
    }
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell padding="checkbox" sx={{ width: 48 }}>
              <Checkbox
                checked={selectedIds.length === data.length && data.length > 0}
                indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </TableCell>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                sx={{
                  fontWeight: 600,
                  width: column.width,
                  minWidth: column.width ? undefined : 150,
                }}
              >
                {column.label}
              </TableCell>
            ))}
            <TableCell sx={{ width: 100 }} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{
                '&:hover .drag-handle': {
                  opacity: 1,
                },
              }}
            >
              <TableCell padding="checkbox">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    className="drag-handle"
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      cursor: 'grab',
                      p: 0.5,
                    }}
                  >
                    <DragIcon fontSize="small" />
                  </IconButton>
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                  />
                </Box>
              </TableCell>
              {columns.map((column) => {
                const value = column.getValue ? column.getValue(row) : (row as Record<string, CellValue>)[column.id];
                return (
                  <TableCell key={column.id}>
                    <EditableCell
                      value={value}
                      column={column}
                      rowId={row.id}
                      onSave={(newValue) => handleCellUpdate(row.id, column.id, newValue)}
                    />
                  </TableCell>
                );
              })}
              <TableCell align="right">
                {onDelete && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(row.id)}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
