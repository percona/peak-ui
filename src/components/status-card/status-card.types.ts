import type { CardProps } from '@mui/material/Card';
import type { ReactNode } from 'react';
import type { StateIndicatorState } from '../state-indicator';

export interface StatusCardProps extends Omit<CardProps, 'children' | 'variant' | 'raised'> {
  /** The fact's state, as on `StateIndicator`. */
  state: StateIndicatorState;
  /** What holds, in a few words: the indicator's label. */
  children: ReactNode;
  /**
   * The one action that changes the state, on its own line under the label: a small text MUI `Button`
   * with an end arrow, `ArrowDownward` for a target further down the page and `ArrowForward` for
   * another page. A click anywhere on the card takes it.
   */
  action: ReactNode;
}
