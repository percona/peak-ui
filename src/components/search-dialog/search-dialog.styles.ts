import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { KBD } from '../kbd/kbd.styles';

// Figma shadow/elevation24
export const ELEVATION_24 =
  '0px 0px 1px 0px rgba(0,0,0,0.08), 0px 24px 12px 0px rgba(0,0,0,0.04), 0px 24px 48px 0px rgba(0,0,0,0.16)';

// The theme's list subheader height; a group's first row scrolls into view with it.
export const GROUP_HEADING_HEIGHT = 32;

// Space above the first group and below the last, in px.
export const LISTBOX_PADDING_BLOCK = 8;

export const OPTION_ICON_CLASS = 'SearchDialogOption-icon';

// The theme marks button focus with a tint alone, which forced colors remove.
export const FORCED_COLORS_FOCUS = {
  [`&.${buttonBaseClasses.focusVisible}`]: {
    '@media (forced-colors: active)': { outline: '2px solid Highlight', outlineOffset: -2 },
  },
};

export const COARSE_POINTER = '@media (hover: none) and (pointer: coarse)';

// The highlighted result row's start bar, in px; 0 removes it and leaves the tint alone.
export const ACTIVE_ROW_BAR_WIDTH = 4;

// The footer's key hints. The knobs, in px; the caps themselves are tuned in kbd.styles.ts.
export const KEY_HINTS = {
  // Footer height and its inner padding.
  minHeight: 32,
  paddingInline: 8,
  paddingBlock: 8,
  // Space between one hint and the next.
  gap: 12,
  // Space between a hint's caps and its label.
  labelGap: 4,
  // Label line height: the cap height, so caps and label share one centre line.
  labelLineHeight: KBD.capSize,
  // Nudges the labels down (positive) or up (negative) against the caps, to align them by eye.
  labelOffset: 0,
} as const;

export const keyHintsSx = {
  display: { xs: 'none', sm: 'flex' },
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: `${KEY_HINTS.gap}px`,
  minHeight: KEY_HINTS.minHeight,
  px: `${KEY_HINTS.paddingInline}px`,
  py: `${KEY_HINTS.paddingBlock}px`,
  flexShrink: 0,
  borderTop: 1,
  borderColor: 'divider',
  typography: 'helperText',
  color: 'text.secondary',
  [COARSE_POINTER]: { display: 'none' },
} as const;

export const keyHintSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: `${KEY_HINTS.labelGap}px`,
} as const;

// helperText's 12px; the ratio's fourth decimal is rounded up so the line lands on a whole pixel.
const LABEL_FONT_SIZE = 12;

export const keyHintLabelSx = {
  lineHeight: Math.ceil((KEY_HINTS.labelLineHeight / LABEL_FONT_SIZE) * 10000) / 10000,
  position: 'relative',
  top: KEY_HINTS.labelOffset,
} as const;
