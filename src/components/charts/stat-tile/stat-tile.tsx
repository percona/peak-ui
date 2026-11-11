import { forwardRef, useId } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { CHARTS_EMPTY_TEXT } from '../charts.constants';
import TrendSlot from '../trend-slot';
import type { StatTileProps } from './stat-tile.types';

const StatTile = forwardRef<HTMLDivElement, StatTileProps>(
  (
    { label, value, sparkline, loading = false, emptyText = CHARTS_EMPTY_TEXT, sx, ...rest },
    ref
  ) => {
    const labelId = useId();

    return (
      <Paper
        ref={ref}
        variant="outlined"
        role="group"
        aria-labelledby={labelId}
        aria-busy={loading}
        sx={[
          { p: 2, display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        <Box display="flex" flexDirection="column" minWidth={112}>
          <Typography id={labelId} variant="caption">
            {label}
          </Typography>
          <Typography variant="h5" component="p" noWrap>
            {loading ? <Skeleton width={80} /> : value}
          </Typography>
        </Box>
        {(loading || sparkline) && (
          <Box flex={1} minWidth={0}>
            <TrendSlot
              sparkline={sparkline}
              loading={loading}
              emptyText={emptyText}
              variant="area"
            />
          </Box>
        )}
      </Paper>
    );
  }
);

StatTile.displayName = 'StatTile';

export default StatTile;
