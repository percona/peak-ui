import type { BoxProps } from '@mui/material/Box';
import type { ReactNode } from 'react';

/**
 * The closed set of states, named after the Figma State indicator variants.
 * - `healthy`: everything counted is fine.
 * - `mixedProblems`: something counted is down or failing; the only filled state, so at most one per banner.
 * - `degraded`: something counted works, but not as it should.
 * - `loading`: the state is being checked.
 * - `errors`: things are failing that are not the subject itself, such as firing alerts or failed backups.
 * - `notSetUp`: nothing is configured yet; show it on a `StatusCard` with the action that sets it up, when the reader can.
 * - `information`: something is in progress and needs no action, such as a running backup.
 * - `silenced`: problems are muted on purpose, such as silenced alerts.
 * - `default`: a neutral fact with nothing to act on.
 */
export type StateIndicatorState =
  | 'healthy'
  | 'mixedProblems'
  | 'degraded'
  | 'loading'
  | 'errors'
  | 'notSetUp'
  | 'information'
  | 'silenced'
  | 'default';

export interface StateIndicatorProps extends Omit<BoxProps<'span'>, 'children'> {
  /** Picks the icon and colors, which are fixed per state. */
  state: StateIndicatorState;
  /** What holds, in a few words, such as "All 14 clusters are healthy". */
  children: ReactNode;
  /** `small` draws every icon at 20px, the problem ones too, for a dense row such as a page header's toolbar. Defaults to `medium`, with 24px problem icons. */
  size?: 'medium' | 'small';
}
