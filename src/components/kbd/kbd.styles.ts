import type { CSSObject, Theme } from '@mui/material/styles';

// The one place the key caps are styled: SearchTrigger, SearchDialog's key hints and any other Kbd use it.

// The knobs, in px unless noted.
export const KBD = {
  // Cap height; a single-character cap is square.
  capSize: 20,
  // Space either side of a word key, such as Esc or Ctrl.
  paddingInline: 2,
  // Space between the caps of a chord.
  gap: 2,
  // Word and letter keys use the body font: the monospace one draws symbols small and lacks ⌘.
  fontSize: 12,
  fontWeight: 500,
  // Symbol keys (⌘ ↑ ↓ ← → ↵ ⌥ ⌃ ⇥ ⌫) are icons in a box this size, so they match the letters on every OS.
  symbolSize: 14,
} as const;

export const kbdRootSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: `${KBD.gap}px`,
  verticalAlign: 'middle',
} as const;

export const kbdCapSx = (theme: Theme): CSSObject => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  minWidth: KBD.capSize,
  height: KBD.capSize,
  paddingInline: `${KBD.paddingInline}px`,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.pxToRem(KBD.fontSize),
  fontWeight: KBD.fontWeight,
  // The text line fills the cap inside its 1px border; the fourth decimal rounds up to land on a whole pixel.
  lineHeight: Math.ceil(((KBD.capSize - 2) / KBD.fontSize) * 10000) / 10000,
  letterSpacing: 0,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.dividers.contour}`,
  borderRadius: `${theme.shape.borderRadiusSm}px`,
});

export const kbdSymbolSx = (theme: Theme): CSSObject => ({
  display: 'block',
  fontSize: theme.typography.pxToRem(KBD.symbolSize),
});
