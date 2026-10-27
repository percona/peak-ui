import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import type { PaletteMode } from '@mui/material/styles';
import { mergeSx } from '@/utils';
import { STATE_GLYPHS, type StateGlyph } from '../state-indicator/state-indicator.glyphs';
import type { SeverityIconProps, SeverityIconSeverity } from './severity-icon.types';

// The State indicator's glyphs and icon colors, so a list reads like the banner above it.
const LOOKS: Record<SeverityIconSeverity, { glyph: StateGlyph; color: string }> = {
  critical: { glyph: 'dangerous', color: 'error.light' },
  error: { glyph: 'emergencyHome', color: 'error.light' },
  warning: { glyph: 'warning', color: 'warning.light' },
  notSetUp: { glyph: 'help', color: 'text.primary' },
  info: { glyph: 'chatInfo', color: 'text.primary' },
};

// The light mode's icon reds and yellows are too pale for text on white, so text there takes the next step that reads.
const LIGHT_TEXT: Partial<Record<SeverityIconSeverity, string>> = {
  critical: 'error.main',
  error: 'error.main',
  warning: 'warning.dark',
};

/** The color for text that goes with a severity's icon, such as a list row's title: the icon's own color, or the readable step of it in light mode. */
export const severityTextColor = (severity: SeverityIconSeverity, mode: PaletteMode): string =>
  (mode === 'light' && LIGHT_TEXT[severity]) || LOOKS[severity].color;

// As the State indicator: every glyph at 24px, or 20px small.
const SIZES = { medium: 24, small: 20 } as const;

/** A severity as the State indicator's icon: critical, error, warning, not set up or info. */
const SeverityIcon = forwardRef<SVGSVGElement, SeverityIconProps>(
  ({ severity, size = 'medium', titleAccess, sx, ...rest }, ref) => {
    const { glyph, color } = LOOKS[severity];
    const { d, size: box } = STATE_GLYPHS[glyph];
    const px = SIZES[size];

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
            width: px,
            height: px,
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
