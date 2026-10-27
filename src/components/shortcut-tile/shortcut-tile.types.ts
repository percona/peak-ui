import type { CardActionAreaProps } from '@mui/material/CardActionArea';
import type { ElementType, ReactNode } from 'react';

export interface ShortcutTileProps extends Omit<CardActionAreaProps, 'children'> {
  /** The place's icon, as the sidebar draws it; shown at 24px. */
  icon: ReactNode;
  /** The place's name: one line, or two in a narrow tile, then an ellipsis. */
  label: string;
  /** Where the place sits, such as "Apps › Operations for MongoDB › Fleet", in a tooltip. */
  tooltip?: ReactNode;
  /** A router link, such as React Router's `Link` with `to`; `href` makes a plain link. */
  component?: ElementType;
  to?: string;
  href?: string;
}
