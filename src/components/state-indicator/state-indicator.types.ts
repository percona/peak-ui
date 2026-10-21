import type { OverrideProps } from '@mui/material/OverridableComponent';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ElementType, ReactNode } from 'react';

/**
 * The closed set of states, named after the Figma State indicator variants.
 * - `healthy`: everything counted is fine.
 * - `mixedProblems`: something counted is down or failing; the only filled state, so at most one per banner.
 * - `degraded`: something counted works, but not as it should.
 * - `loading`: the state is being checked.
 * - `errors`: things are failing that are not the subject itself, such as firing alerts or failed backups.
 * - `notSetUp`: nothing is configured yet; follow it with an `actionable` indicator when the reader can set it up.
 * - `information`: something is in progress and needs no action, such as a running backup.
 * - `silenced`: problems are muted on purpose, such as silenced alerts.
 * - `default`: a neutral fact with nothing to act on.
 * - `actionable`: a link to the action that changes the state, such as "Set up alerts".
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
  | 'default'
  | 'actionable';

export interface StateIndicatorOwnProps {
  /** Picks the icon and colors, which are fixed per state. */
  state: StateIndicatorState;
  /** What holds, in a few words, such as "All 14 clusters are healthy". */
  children: ReactNode;
  /** Where an `actionable` indicator leads; other states ignore it. */
  href?: string;
  sx?: SxProps<Theme>;
}

export interface StateIndicatorTypeMap<P = object, D extends ElementType = 'span'> {
  props: P & StateIndicatorOwnProps;
  defaultComponent: D;
}

export type StateIndicatorProps<
  D extends ElementType = StateIndicatorTypeMap['defaultComponent'],
  P = object,
> = OverrideProps<StateIndicatorTypeMap<P, D>, D> & { component?: ElementType };
