import { describe, expect, it } from 'vitest';
import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { getThemeOptions } from './utils';
import { semanticTokensDark, semanticTokensLight } from './themes/base';

// Executable contract for the "Design Constraints" section of AGENTS.md.
// A failure here means a documented brand/perceptual constraint was broken:
// fix the theme change — do not update these expectations.

type ThemeName = 'base' | 'pmm' | 'sep';
type Mode = 'light' | 'dark';
type SlotStyle = Record<string, unknown>;
type SlotResolver = (props: { theme: Theme; ownerState: SlotStyle }) => SlotStyle;

const THEMES: ThemeName[] = ['base', 'pmm', 'sep'];
const MODES: Mode[] = ['light', 'dark'];

const build = (name: ThemeName, mode: Mode): Theme => createTheme(getThemeOptions(name)(mode));

const resolveSlot = (
  theme: Theme,
  component: string,
  slot: string,
  ownerState: SlotStyle = {}
): SlotStyle => {
  const components = (theme.components ?? {}) as Record<
    string,
    { styleOverrides?: Record<string, unknown> } | undefined
  >;
  const override = components[component]?.styleOverrides?.[slot];
  expect(
    override,
    `${component}.styleOverrides.${slot} is missing — a Base slot was replaced instead of composed (use mergeThemeOptions)`
  ).toBeDefined();
  return typeof override === 'function'
    ? (override as SlotResolver)({ theme, ownerState })
    : (override as SlotStyle);
};

const rgbChannels = (color: unknown): number[] => {
  const match = String(color).match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  expect(match, `expected an rgb/rgba color, got: ${String(color)}`).not.toBeNull();
  return match!.slice(1, 4).map(Number);
};

const isAchromatic = (color: unknown): boolean => {
  const [r, g, b] = rgbChannels(color);
  return Math.max(r, g, b) - Math.min(r, g, b) <= 2;
};

describe.each(THEMES)('theme contract: %s', (themeName) => {
  describe.each(MODES)('%s mode', (mode) => {
    const theme = build(themeName, mode);
    const inverted = mode === 'light' ? semanticTokensDark : semanticTokensLight;

    it('keeps the per-mode action opacity model', () => {
      const { hoverOpacity, selectedOpacity, disabledOpacity, focusOpacity } = theme.palette.action;
      expect(
        { hoverOpacity, selectedOpacity, disabledOpacity, focusOpacity },
        'dark mode needs higher alphas to stay perceptible; MUI alpha() math depends on these'
      ).toEqual(
        mode === 'light'
          ? { hoverOpacity: 0.04, selectedOpacity: 0.08, disabledOpacity: 0.12, focusOpacity: 0.12 }
          : { hoverOpacity: 0.08, selectedOpacity: 0.16, disabledOpacity: 0.15, focusOpacity: 0.15 }
      );
    });

    it('keeps the neutral action tints identical to Base', () => {
      const base = build('base', mode).palette.action;
      const { active, hover, selected, disabled, focus } = theme.palette.action;
      expect(
        { active, hover, selected, disabled, focus },
        'action.* is the neutral state layer for default surfaces — brand tinting belongs in primary.*'
      ).toEqual({
        active: base.active,
        hover: base.hover,
        selected: base.selected,
        disabled: base.disabled,
        focus: base.focus,
      });
    });

    it('exposes state tints for primary-colored surfaces', () => {
      for (const token of [
        'hover',
        'selected',
        'focus',
        'focusVisible',
        'outlinedBorder',
      ] as const) {
        expect(
          theme.palette.primary[token],
          `primary.${token} is the state tint for primary-colored surfaces — parallel to action.*, do not collapse the layers`
        ).toMatch(/^rgba?\(/);
      }
    });

    it('gives every semantic color a surface token', () => {
      const palette = theme.palette as unknown as Record<string, { surface?: string } | undefined>;
      for (const color of ['error', 'warning', 'info', 'success', 'neutral']) {
        expect(
          palette[color]?.surface,
          `palette.${color}.surface backs filled Chips and status surfaces — light/main are reserved for borders/icons`
        ).toBeTruthy();
      }
    });

    it('outlined Chip keeps warning on main — warning.light lacks contrast', () => {
      const style = resolveSlot(theme, 'MuiChip', 'outlined', { color: 'warning' });
      expect(style.color).toBe(theme.palette.warning.main);
      expect(style.borderColor).toBe(theme.palette.warning.main);
      expect(style.color).not.toBe(theme.palette.warning.light);
    });

    it('outlined Chip uses the light tone for other semantic colors', () => {
      for (const color of ['success', 'error', 'info'] as const) {
        const style = resolveSlot(theme, 'MuiChip', 'outlined', { color });
        expect(style.color, `outlined ${color} Chip text/border come from ${color}.light`).toBe(
          theme.palette[color].light
        );
        expect(style.borderColor).toBe(theme.palette[color].light);
      }
    });

    it('filled Chip colors from the surface token, not light/main', () => {
      const palette = theme.palette as unknown as Record<
        string,
        { surface?: string; contrastText?: string }
      >;
      for (const color of ['success', 'error', 'info', 'warning']) {
        const style = resolveSlot(theme, 'MuiChip', 'filled', { color });
        expect(style.backgroundColor).toBe(palette[color].surface);
        expect(style.color).toBe(palette[color].contrastText);
      }
    });

    it('renders tooltips on the inverted mode surface', () => {
      const tooltip = resolveSlot(theme, 'MuiTooltip', 'tooltip');
      expect(
        tooltip.backgroundColor,
        'tooltips invert the app mode: light app → dark tooltip, dark app → light tooltip'
      ).toBe(inverted.surfaces.elevation1);
      expect(tooltip.color).toBe(inverted.text.primary);
      const arrow = resolveSlot(theme, 'MuiTooltip', 'arrow');
      expect(arrow.color).toBe(inverted.surfaces.elevation1);
    });

    it('keeps tooltip link styling nested inside the tooltip override', () => {
      const tooltip = resolveSlot(theme, 'MuiTooltip', 'tooltip');
      const link = tooltip['& .MuiLink-root'] as SlotStyle | undefined;
      expect(
        link,
        'link styles live inside the MuiTooltip override (not MuiLink.styleOverrides) so links invert with the surface'
      ).toBeDefined();
      expect(link?.color).toBe(inverted.text.accent1);
    });
  });
});

describe('primary vs action state layers', () => {
  describe.each(MODES)('%s mode', (mode) => {
    it('base keeps primary state tints neutral (brand black/white)', () => {
      const { palette } = build('base', mode);
      for (const token of ['hover', 'selected', 'focus'] as const) {
        expect(
          isAchromatic(palette.primary[token]),
          `base primary.${token} must stay achromatic — brand hues belong to PMM/SEP`
        ).toBe(true);
      }
      if (mode === 'light') {
        expect(palette.primary.hover).toBe(palette.action.hover);
        expect(palette.primary.selected).toBe(palette.action.selected);
        expect(palette.primary.focus).toBe(palette.action.focus);
      }
    });

    it.each(['pmm', 'sep'] as const)('%s diverges primary tints from the neutral layer', (name) => {
      const { palette } = build(name, mode);
      for (const token of ['hover', 'selected', 'focus'] as const) {
        expect(
          palette.primary[token],
          `${name} primary.${token} must carry the brand tint, distinct from neutral action.${token}`
        ).not.toBe(palette.action[token]);
        expect(isAchromatic(palette.primary[token])).toBe(false);
      }
    });
  });
});

describe('theme extension contract', () => {
  describe.each(['pmm', 'sep'] as const)('%s', (name) => {
    it('composes with Base instead of replacing it', () => {
      const theme = build(name, 'light');
      const components = (theme.components ?? {}) as Record<string, unknown>;
      // Base-owned slots must survive the merge, child-owned slots must land on top.
      for (const slot of ['MuiChip', 'MuiTooltip', 'MuiButton', 'MuiLink']) {
        expect(
          components[slot],
          `Base ${slot} override lost — never raw-deepmerge theme options`
        ).toBeDefined();
      }
      expect(components.MuiAppBar, `${name}'s own MuiAppBar override missing`).toBeDefined();
    });
  });
});
