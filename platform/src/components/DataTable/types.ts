/**
 * 🇿🇼 Nyuchi Platform - DataTable Types
 * Notion-style table component types
 */

export type ViewType = 'table' | 'kanban' | 'cards';

export type ColumnType = 'text' | 'select' | 'date' | 'number' | 'email' | 'url' | 'multiselect';

export type CellValue = string | number | boolean | string[] | null | undefined;

export interface Column<T = Record<string, CellValue>> {
  id: string;
  label: string;
  type: ColumnType;
  width?: number;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  options?: string[]; // For select/multiselect
  render?: (value: CellValue, row: T) => React.ReactNode;
  getValue?: (row: T) => CellValue;
  setValue?: (row: T, value: CellValue) => void;
}

export interface DataTableProps<T = Record<string, CellValue>> {
  data: T[];
  columns: Column<T>[];
  onUpdate?: (id: string, field: string, value: CellValue) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCreate?: () => void;
  loading?: boolean;
  searchable?: boolean;
  groupByColumn?: string; // For kanban view
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export interface CellEditProps {
  value: CellValue;
  column: Column;
  onSave: (value: CellValue) => void;
  onCancel: () => void;
}
