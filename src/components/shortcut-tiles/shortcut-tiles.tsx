import { Children, forwardRef, isValidElement } from 'react';
import Box from '@mui/material/Box';
import { mergeSx } from '@/utils';
import type { ShortcutTilesProps } from './shortcut-tiles.types';

// The grid's own width decides, not the viewport's: two tiles a line, three from 640px,
// and every tile on one line once each cell fits a name like "Instances overview": five at 1030px, six at 1236px.
const THREE_FROM = 640;
const MIN_TILE = 206;

// The lines inside: none right of a line's last tile, none under the last line, as the grid's own box closes it.
const columns = (count: number, cols: number) => ({
  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  '& > li:nth-of-type(n)': { borderRightWidth: 1, borderBottomWidth: 1 },
  [`& > li:nth-of-type(${cols}n)`]: { borderRightWidth: 0 },
  [`& > li:nth-of-type(n + ${(Math.ceil(count / cols) - 1) * cols + 1})`]: {
    borderBottomWidth: 0,
  },
});

/** Shortcut tiles as a grid of ruled cells in equal widths, whatever their number, wrapping as the grid narrows. */
const ShortcutTiles = forwardRef<HTMLDivElement, ShortcutTilesProps>(
  ({ children, sx, ...rest }, ref) => {
    const tiles = Children.toArray(children);
    const count = tiles.length;

    return (
      <Box ref={ref} sx={mergeSx({ containerType: 'inline-size' }, sx)} {...rest}>
        <Box
          component="ul"
          // list-style: none drops the list role in Safari.
          role="list"
          sx={(theme) => ({
            display: 'grid',
            m: 0,
            p: 0,
            listStyle: 'none',
            ...columns(count, 2),
            [theme.containerQueries.up(THREE_FROM)]: columns(count, 3),
            [theme.containerQueries.up(count * MIN_TILE)]: columns(count, count),
            // The line above, such as a page header's divider, closes the top.
            border: `1px solid ${theme.palette.divider}`,
            borderTop: 0,
            '& > li': { borderStyle: 'solid', borderColor: theme.palette.divider },
          })}
        >
          {tiles.map((tile, index) => (
            <Box
              component="li"
              key={isValidElement(tile) && tile.key != null ? tile.key : index}
              sx={{ display: 'flex', minWidth: 0, borderWidth: 0 }}
            >
              {tile}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
);

ShortcutTiles.displayName = 'ShortcutTiles';

export default ShortcutTiles;
