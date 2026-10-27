import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import { mergeSx } from '@/utils';
import { STATE_GLYPHS, type StateGlyph } from './state-indicator.glyphs';
import type { StateIndicatorProps, StateIndicatorState } from './state-indicator.types';

interface Look {
  glyph?: StateGlyph;
  /** Palette key for the icon. */
  icon?: string;
  /** Palette key for the label. */
  text: string;
  /** Palette key for the filled background. */
  surface?: string;
}

const LOOKS: Record<StateIndicatorState, Look> = {
  healthy: { glyph: 'checkCircle', icon: 'success.light', text: 'text.primary' },
  mixedProblems: {
    glyph: 'dangerous',
    icon: 'error.contrastText',
    text: 'error.contrastText',
    surface: 'error.surface',
  },
  degraded: { glyph: 'warning', icon: 'warning.light', text: 'text.primary' },
  loading: { glyph: 'cached', icon: 'text.primary', text: 'text.primary' },
  errors: { glyph: 'emergencyHome', icon: 'error.light', text: 'text.primary' },
  notSetUp: { glyph: 'help', icon: 'text.primary', text: 'text.primary' },
  information: { glyph: 'chatInfo', icon: 'text.primary', text: 'text.primary' },
  silenced: { glyph: 'notificationsOff', icon: 'text.secondary', text: 'text.secondary' },
  default: { text: 'text.secondary' },
};

const spin = keyframes`to { transform: rotate(360deg); }`;

// The icon's row: a 22px body1 line plus 1px above and below, as in the Figma State indicator.
const ROW = 24;
// Every glyph at 24px, so the states read as one set; a small indicator draws them all at 20px.
const GLYPH = 24;
const SMALL_GLYPH = 20;

/** One fact with its state: an icon and a short label whose colors are fixed per state. */
const StateIndicator = forwardRef<HTMLSpanElement, StateIndicatorProps>(
  ({ state, children, size = 'medium', sx, ...rest }, ref) => {
    const look = LOOKS[state];
    const glyph = look.glyph && STATE_GLYPHS[look.glyph];

    return (
      <Box
        ref={ref}
        component="span"
        data-state={state}
        sx={mergeSx(
          {
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: '2px',
            p: 0.5,
            borderRadius: (theme) => `${theme.shape.borderRadiusXs}px`,
            ...(look.surface && { bgcolor: look.surface }),
          },
          sx
        )}
        {...rest}
      >
        {glyph && (
          <Box
            component="span"
            aria-hidden
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: ROW,
              flexShrink: 0,
              color: look.icon,
            }}
          >
            <Box
              component="svg"
              viewBox={`0 0 ${glyph.size} ${glyph.size}`}
              focusable="false"
              data-glyph={look.glyph}
              sx={{
                display: 'block',
                width: size === 'small' ? SMALL_GLYPH : GLYPH,
                height: size === 'small' ? SMALL_GLYPH : GLYPH,
                fill: 'currentColor',
                ...(state === 'loading' && {
                  '@media (prefers-reduced-motion: no-preference)': {
                    animation: `${spin} 1.6s linear infinite`,
                  },
                }),
              }}
            >
              <path d={glyph.d} />
            </Box>
          </Box>
        )}
        <Box
          component="span"
          sx={{
            typography: 'body1',
            color: look.text,
            ...(state === 'mixedProblems' && { fontWeight: 'fontWeightBold' }),
            py: '1px',
            px: glyph ? 0.5 : 0,
            minWidth: 0,
            overflowWrap: 'break-word',
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);

StateIndicator.displayName = 'StateIndicator';

export default StateIndicator;
