/**
 * 🇿🇼 Nyuchi Platform - Kanban View
 * Notion-style kanban board
 */

'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataTableProps, CellValue } from './types';
import { nyuchiColors } from '../../theme/zimbabwe-theme';

interface KanbanViewProps<T> extends DataTableProps<T> {
  groupByColumn: string;
}

export function KanbanView<T extends { id: string }>({
  data,
  columns,
  onUpdate: _onUpdate,
  onDelete,
  groupByColumn,
}: KanbanViewProps<T>) {
  const groupColumn = columns.find((col) => col.id === groupByColumn);

  if (!groupColumn || groupColumn.type !== 'select') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Kanban view requires a select column for grouping
        </Typography>
      </Box>
    );
  }

  const groups = groupColumn.options || [];
  const groupedData = groups.map((group) => ({
    group,
    items: data.filter((item) => {
      const value = groupColumn.getValue ? groupColumn.getValue(item) : (item as Record<string, CellValue>)[groupByColumn];
      return value === group;
    }),
  }));

  const getGroupColor = (index: number) => {
    const colors = [
      nyuchiColors.sunsetOrange,
      nyuchiColors.zimbabweGreen,
      nyuchiColors.zimbabweYellow,
      nyuchiColors.charcoal,
    ];
    return colors[index % colors.length];
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
      {groupedData.map((group, groupIndex) => (
        <Box
          key={group.group}
          sx={{
            minWidth: 300,
            flex: '0 0 300px',
          }}
        >
          {/* Column Header */}
          <Box
            sx={{
              p: 2,
              mb: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              borderLeft: '4px solid',
              borderColor: getGroupColor(groupIndex),
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {group.group}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
            </Typography>
          </Box>

          {/* Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {group.items.map((item) => (
              <Card
                key={item.id}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: getGroupColor(groupIndex),
                    boxShadow: 1,
                  },
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {columns
                    .filter((col) => col.id !== groupByColumn)
                    .slice(0, 4)
                    .map((column) => {
                      const value = column.getValue ? column.getValue(item) : (item as Record<string, CellValue>)[column.id];

                      if (!value) return null;

                      return (
                        <Box key={column.id} sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {column.label}
                          </Typography>
                          {column.type === 'select' || column.type === 'multiselect' ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {Array.isArray(value) ? (
                                value.map((v) => (
                                  <Chip key={v} label={v} size="small" />
                                ))
                              ) : (
                                <Chip label={String(value)} size="small" />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: column.id === columns[0].id ? 600 : 400 }}>
                              {column.type === 'date' && typeof value === 'string'
                                ? new Date(value).toLocaleDateString()
                                : String(value)}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.5 }}>
                  <IconButton size="small" title="Edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {onDelete && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(item.id)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            ))}

            {group.items.length === 0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  color: 'text.disabled',
                }}
              >
                <Typography variant="body2">No items</Typography>
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
