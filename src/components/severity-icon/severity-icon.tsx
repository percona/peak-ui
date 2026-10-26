import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { mergeSx } from '@/utils';
import { STATE_GLYPHS, type StateGlyph } from '../state-indicator/state-indicator.glyphs';
import type { SeverityIconProps, SeverityIconSeverity } from './severity-icon.types';

// The State indicator's problem glyphs and icon colors, so a list of problems reads like the banner above it.
const LOOKS: Record<SeverityIconSeverity, { glyph: StateGlyph; color: string }> = {
  critical: { glyph: 'dangerous', color: 'error.light' },
  error: { glyph: 'emergencyHome', color: 'error.light' },
  warning: { glyph: 'warning', color: 'warning.light' },
};

const SIZES = { medium: 24, small: 20 } as const;

/** A problem's severity as the State indicator's icon: critical, error or warning. */
const SeverityIcon = forwardRef<SVGSVGElement, SeverityIconProps>(
  ({ severity, size = 'medium', titleAccess, sx, ...rest }, ref) => {
    const { glyph, color } = LOOKS[severity];
    const { d, size: box } = STATE_GLYPHS[glyph];

    return (
      <Box
        ref={ref}
        component="svg"
        viewBox={`0 0 ${box} ${box}`}
        focusable="false"
        data-severity={severity}
        {...(titleAccess ? { role: 'img', 'aria-label': titleAccess } : { 'aria-hidden': true })}
        sx={mergeSx(
          {
            display: 'block',
            flexShrink: 0,
            width: SIZES[size],
            height: SIZES[size],
            fill: 'currentColor',
            color,
          },
          sx
        )}
        {...rest}
      >
        <path d={d} />
      </Box>
    );
  }
);

SeverityIcon.displayName = 'SeverityIcon';

export default SeverityIcon;
