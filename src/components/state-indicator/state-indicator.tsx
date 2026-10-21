import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import { keyframes } from '@mui/material/styles';
import { mergeSx } from '@/utils';
import { STATE_GLYPHS, type StateGlyph } from './state-indicator.glyphs';
import type {
  StateIndicatorProps,
  StateIndicatorState,
  StateIndicatorTypeMap,
} from './state-indicator.types';

interface Look {
  glyph?: StateGlyph;
  /** Palette key for the icon. */
  icon?: string;
  /** Palette key for the label. */
  text: string;
  /** Palette key for the filled background. */
  surface?: string;
}

const LOOKS: Record<Exclude<StateIndicatorState, 'actionable'>, Look> = {
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

// 24px rows: a 22px body1 line plus 1px above and below, as in the Figma State indicator.
const ROW = 24;

/** One fact with its state: an icon and a short label whose colors are fixed per state. */
const StateIndicatorRoot = forwardRef<HTMLElement, StateIndicatorProps>(
  ({ state, children, component, href, sx, ...rest }, ref) => {
    if (state === 'actionable') {
      return (
        <Link
          ref={ref as never}
          component={component ?? 'a'}
          // A router link builds its own href from `to`.
          {...(href !== undefined && { href })}
          underline="always"
          variant="body1"
          sx={mergeSx(
            {
              display: 'inline-block',
              px: '2px',
              py: '1px',
              borderRadius: (theme) => `${theme.shape.borderRadiusXs}px`,
            },
            sx
          )}
          {...rest}
        >
          {children}
        </Link>
      );
    }

    const look = LOOKS[state];

    return (
      <Box
        ref={ref}
        component={component ?? 'span'}
        data-state={state}
        sx={mergeSx(
          {
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: '2px',
            px: '2px',
            borderRadius: (theme) => `${theme.shape.borderRadiusXs}px`,
            ...(look.surface && { bgcolor: look.surface }),
          },
          sx
        )}
        {...rest}
      >
        {look.glyph && (
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
              viewBox="0 0 20 20"
              focusable="false"
              data-glyph={look.glyph}
              sx={{
                display: 'block',
                width: 20,
                height: 20,
                fill: 'currentColor',
                ...(state === 'loading' && {
                  '@media (prefers-reduced-motion: no-preference)': {
                    animation: `${spin} 1.6s linear infinite`,
                  },
                }),
              }}
            >
              <path d={STATE_GLYPHS[look.glyph]} />
            </Box>
          </Box>
        )}
        <Box
          component="span"
          sx={{
            typography: 'body1',
            color: look.text,
            py: '1px',
            px: look.glyph ? '4px' : 0,
            minWidth: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);

StateIndicatorRoot.displayName = 'StateIndicator';

// Typed like MUI's own components, so `component={RouterLink} to="/x"` type-checks.
const StateIndicator = StateIndicatorRoot as unknown as OverridableComponent<StateIndicatorTypeMap>;

export default StateIndicator;
