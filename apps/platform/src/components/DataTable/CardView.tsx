/**
 * 🇿🇼 Nyuchi Platform - Card View
 * Grid layout with cards
 */

'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataTableProps, CellValue } from './types';

type CardViewProps<T> = DataTableProps<T>;

export function CardView<T extends { id: string }>({
  data,
  columns,
  onDelete,
}: CardViewProps<T>) {
  return (
    <Grid container spacing={3}>
      {data.map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
              {columns.slice(0, 5).map((column, index) => {
                const value = column.getValue ? column.getValue(item) : (item as Record<string, CellValue>)[column.id];

                if (!value) return null;

                return (
                  <Box key={column.id} sx={{ mb: index < 4 ? 1.5 : 0 }}>
                    {index === 0 ? (
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {value}
                      </Typography>
                    ) : (
                      <>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mb: 0.5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {column.label}
                        </Typography>
                        {column.type === 'select' ? (
                          <Chip label={value} size="small" />
                        ) : column.type === 'multiselect' && Array.isArray(value) ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {value.map((v) => (
                              <Chip key={v} label={v} size="small" />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {column.type === 'date' && typeof value === 'string'
                              ? new Date(value).toLocaleDateString()
                              : column.type === 'url' && typeof value === 'string' ? (
                                <a
                                  href={value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'inherit' }}
                                >
                                  {value}
                                </a>
                              ) : column.type === 'email' && typeof value === 'string' ? (
                                <a href={`mailto:${value}`} style={{ color: 'inherit' }}>
                                  {value}
                                </a>
                              ) : (
                                String(value)
                              )}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                );
              })}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
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
        </Grid>
      ))}
    </Grid>
  );
}
