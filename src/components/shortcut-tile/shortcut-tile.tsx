import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { mergeSx } from '@/utils';
import Tooltip from '../tooltip';
import type { ShortcutTileProps } from './shortcut-tile.types';

const HEIGHT = 48;

/** A link to another place, its icon and name centred in a cell whose whole surface is the link. */
const ShortcutTile = forwardRef<HTMLButtonElement, ShortcutTileProps>(
  ({ icon, label, tooltip, sx, ...rest }, ref) => {
    const area = (
      <CardActionArea
        ref={ref}
        disableRipple
        sx={mergeSx(
          (theme) => ({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            minHeight: HEIGHT,
            px: 2,
            py: 1,
            borderRadius: 0,
            // Its own tint, as StatusCard's, rather than MUI's overlay.
            '& .MuiCardActionArea-focusHighlight': { display: 'none' },
            '@media (hover: hover)': {
              '&:hover': {
                backgroundImage: `linear-gradient(${theme.palette.primary.hover}, ${theme.palette.primary.hover})`,
              },
            },
            '&.Mui-focusVisible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: -2,
            },
          }),
          sx
        )}
        {...rest}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ display: 'flex', flexShrink: 0, '& svg': { fontSize: 24 } }}
        >
          {icon}
        </Box>
        {/* The sidebar's label style; a name too long for one line, as in a narrow row, takes a second line before it is cut. */}
        <Typography
          component="span"
          variant="menuText"
          sx={{
            minWidth: 0,
            textAlign: 'center',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            overflowWrap: 'anywhere',
          }}
        >
          {label}
        </Typography>
      </CardActionArea>
    );

    return tooltip ? (
      <Tooltip title={tooltip} describeChild>
        {area}
      </Tooltip>
    ) : (
      area
    );
  }
);

ShortcutTile.displayName = 'ShortcutTile';

export default ShortcutTile;
