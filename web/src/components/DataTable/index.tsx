/**
 * 🇿🇼 Nyuchi Platform - DataTable Component
 * Notion-style data table with multiple views
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ViewList as TableIcon,
  ViewKanban as KanbanIcon,
  ViewModule as CardIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { DataTableProps, ViewType, CellValue } from './types';
import { TableView } from './TableView';
import { KanbanView } from './KanbanView';
import { CardView } from './CardView';

export function DataTable<T extends { id: string }>(props: DataTableProps<T>) {
  const {
    data,
    columns,
    onCreate,
    loading,
    searchable = true,
    emptyMessage = 'No data available',
    emptyAction,
  } = props;

  const [view, setView] = useState<ViewType>('table');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter data based on search
  const filteredData = search
    ? data.filter((item) =>
        columns.some((column) => {
          const value = column.getValue ? column.getValue(item) : (item as Record<string, CellValue>)[column.id];
          return value && value.toString().toLowerCase().includes(search.toLowerCase());
        })
      )
    : data;

  const renderView = () => {
    if (loading) {
      return (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      );
    }

    if (filteredData.length === 0) {
      return (
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {search ? 'No results found' : emptyMessage}
          </Typography>
          {!search && emptyAction && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={emptyAction.onClick}
            >
              {emptyAction.label}
            </Button>
          )}
        </Box>
      );
    }

    switch (view) {
      case 'kanban':
        return <KanbanView {...props} data={filteredData} groupByColumn="status" />;
      case 'cards':
        return <CardView {...props} data={filteredData} />;
      default:
        return (
          <TableView
            {...props}
            data={filteredData}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
          />
        );
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        {searchable && (
          <TextField
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* View Switcher */}
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, newView) => newView && setView(newView)}
          size="small"
        >
          <ToggleButton value="table">
            <Tooltip title="Table View">
              <TableIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="kanban">
            <Tooltip title="Kanban View">
              <KanbanIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="cards">
            <Tooltip title="Card View">
              <CardIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Actions */}
        <Tooltip title="Filter">
          <IconButton size="small">
            <FilterIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export">
          <IconButton size="small">
            <ExportIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {onCreate && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreate}
            size="small"
          >
            New
          </Button>
        )}
      </Toolbar>

      {/* Selected Items Bar */}
      {selectedIds.length > 0 && view === 'table' && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'action.selected',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {selectedIds.length} selected
          </Typography>
          <Button size="small" onClick={() => setSelectedIds([])}>
            Clear
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button size="small" color="error">
            Delete Selected
          </Button>
        </Box>
      )}

      {/* View Content */}
      <Box sx={{ minHeight: 400 }}>{renderView()}</Box>
    </Paper>
  );
}

export * from './types';
