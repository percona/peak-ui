import type { BoxProps } from '@mui/material/Box';
import type { ReactNode } from 'react';

export interface ShortcutTilesProps extends Omit<BoxProps, 'children'> {
  /** One `ShortcutTile` per place, in reading order. */
  children: ReactNode;
}
