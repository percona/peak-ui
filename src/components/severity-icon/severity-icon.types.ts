import type { BoxProps } from '@mui/material/Box';

/**
 * How bad a problem is, worst first, then what is fine but could be better.
 * - `critical`: something is down or can't take writes; the State indicator's octagon.
 * - `error`: something is failing but still serves; its diamond.
 * - `warning`: something works, but not as it should; its triangle.
 * - `notSetUp`: something isn't configured yet; its circled question mark.
 * - `info`: something worth knowing, nothing urgent; its speech bubble.
 */
export type SeverityIconSeverity = 'critical' | 'error' | 'warning' | 'notSetUp' | 'info';

export interface SeverityIconProps extends Omit<BoxProps<'svg'>, 'children' | 'color'> {
  /** Picks the glyph and its color, which are fixed per severity. */
  severity: SeverityIconSeverity;
  /** `medium` is 24px, as the State indicator draws its icons; `small` is 20px. */
  size?: 'medium' | 'small';
  /** Accessible name. When set, the icon is exposed as an image; otherwise it stays decorative (aria-hidden). */
  titleAccess?: string;
}
