import type { BoxProps } from '@mui/material/Box';

/** A half-open range of UTF-16 indices into a text: `start` is included, `end` is not. */
export type MatchRange = readonly [start: number, end: number];

export interface TextHighlightProps extends Omit<BoxProps<'span'>, 'children' | 'ref'> {
  /** The text to draw. */
  text: string;
  /** Marks every whitespace-separated term, ignoring case and accents, preferring matches at word starts. */
  query?: string;
  /** Explicit ranges to mark; wins over `query`. */
  ranges?: readonly MatchRange[];
}
