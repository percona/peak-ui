import type { BoxProps } from '@mui/material/Box';
import type { ReactNode } from 'react';

export interface StatusBannerProps extends Omit<BoxProps<'ul'>, 'children' | 'component'> {
  /**
   * One `StateIndicator` per facet, most important first. To keep an indicator and its
   * `actionable` link together, wrap both in a fragment: dashes go between facets only.
   */
  children: ReactNode;
}
