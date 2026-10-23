import type { BoxProps } from '@mui/material/Box';
import type { ReactNode } from 'react';

export interface StatusBannerProps extends Omit<BoxProps<'ul'>, 'children' | 'component'> {
  /**
   * One facet per child, most important first: a `StateIndicator` when there is nothing to do,
   * or a `StatusCard` when the facet has an action. Pass them directly, not wrapped, so the
   * banner can tell cards apart.
   */
  children: ReactNode;
}
