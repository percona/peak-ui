import { beforeAll, describe, expect, it } from 'vitest';
import { createTheme, decomposeColor, type Theme } from '@mui/material/styles';
import { getThemeOptions } from './utils';
import { semanticTokensDark, semanticTokensLight } from './themes/base';

// Executable contract for AGENTS.md "Design Constraints" — on failure, fix the theme change, not these expectations.

type ThemeName = 'base' | 'pmm' | 'sep';
type Mode = 'light' | 'dark';
type SlotStyle = Record<string, unknown>;
type SlotResolver = (props: { theme: Theme; ownerState: SlotStyle }) => SlotStyle;
type ComponentEntry = { styleOverrides?: Record<string, unknown>; variants?: unknown[] };

const THEMES: ThemeName[] = ['base', 'pmm', 'sep'];
const MODES: Mode[] = ['light', 'dark'];

const themeCache = new Map<string, Theme>();
const build = (name: ThemeName, mode: Mode): Theme => {
  const key = `${name}-${mode}`;
  if (!themeCache.has(key)) themeCache.set(key, createTheme(getThemeOptions(name)(mode)));
  return themeCache.get(key)!;
};

const components = (theme: Theme): Record<string, ComponentEntry | undefined> =>
  (theme.components ?? {}) as Record<string, ComponentEntry | undefined>;

const resolveSlot = (
  theme: Theme,
  component: string,
  slot: string,
  ownerState: SlotStyle = {}
): SlotStyle => {
  const override = components(theme)[component]?.styleOverrides?.[slot];
  expect(
    override,
    `${component}.styleOverrides.${slot} is missing from the built theme — Base's slot did not survive the theme merge`
  ).toBeDefined();
  return typeof override === 'function'
    ? (override as SlotResolver)({ theme, ownerState })
    : (override as SlotStyle);
};

// Accepts any notation MUI can parse (rgb/rgba/hex/hsl) — the constraint is perceptual, not notational.
const channels = (color: unknown): { space: string; values: number[] } => {
  try {
    const { type, values } = decomposeColor(String(color));
    return { space: type, values };
  } catch {
    expect.fail(`expected a parseable CSS color, got: ${String(color)}`);
  }
};

const isAchromatic = (color: unknown): boolean => {
  const { space, values } = channels(color);
  if (space.startsWith('hsl')) return values[1] <= 2;
  const [r, g, b] = values;
  return Math.max(r, g, b) - Math.min(r, g, b) <= 2;
};

describe.each(THEMES)('theme contract: %s', (themeName) => {
  describe.each(MODES)('%s mode', (mode) => {
    let theme: Theme;
    const inverted = mode === 'light' ? semanticTokensDark : semanticTokensLight;

    beforeAll(() => {
      theme = build(themeName, mode);
    });

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

    it('keeps the neutral action tints achromatic', () => {
      for (const token of ['active', 'hover', 'selected', 'disabled', 'focus'] as const) {
        expect(
          isAchromatic(theme.palette.action[token]),
          `action.${token} is the neutral state layer for default surfaces — brand tinting belongs in primary.*`
        ).toBe(true);
      }
    });

    it('exposes state tints for primary-colored surfaces', () => {
      for (const token of [
        'hover',
        'selected',
        'focus',
        'focusVisible',
        'outlinedBorder',
      ] as const) {
        const tint = theme.palette.primary[token];
        expect(
          tint,
          `primary.${token} is the state tint for primary-colored surfaces — parallel to action.*, do not collapse the layers`
        ).toBeDefined();
        channels(tint);
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

    it('outlined Chip uses the light tone for all other palette colors', () => {
      for (const color of ['success', 'error', 'info', 'primary', 'secondary'] as const) {
        const style = resolveSlot(theme, 'MuiChip', 'outlined', { color });
        expect(style.color, `outlined ${color} Chip text/border come from ${color}.light`).toBe(
          theme.palette[color].light
        );
        expect(style.borderColor).toBe(theme.palette[color].light);
      }
      const fallback = resolveSlot(theme, 'MuiChip', 'outlined', { color: 'default' });
      expect(fallback.color, 'outlined default Chip uses text.primary').toBe(
        theme.palette.text.primary
      );
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

    it.each(['pmm', 'sep'] as const)(
      '%s keeps the neutral action tints identical to Base',
      (name) => {
        const base = build('base', mode).palette.action;
        const { active, hover, selected, disabled, focus } = build(name, mode).palette.action;
        expect(
          { active, hover, selected, disabled, focus },
          'child themes inherit the neutral state layer from Base — brand tinting belongs in primary.*'
        ).toEqual({
          active: base.active,
          hover: base.hover,
          selected: base.selected,
          disabled: base.disabled,
          focus: base.focus,
        });
      }
    );
  });
});

describe('theme extension contract', () => {
  describe.each(['pmm', 'sep'] as const)('%s', (name) => {
    it.each(MODES)('keeps Base component slots in the built theme (%s mode)', (mode) => {
      const built = components(build(name, mode));
      for (const slot of ['MuiChip', 'MuiTooltip', 'MuiButton', 'MuiLink']) {
        expect(
          built[slot],
          `Base's ${slot} override is missing from the built ${name} theme — child options replaced Base instead of composing`
        ).toBeDefined();
      }
    });

    // Tripwire for raw deepmerge: it replaces variants arrays instead of concatenating them base-first.
    it.each(MODES)('keeps Base variants alongside child variants (%s mode)', (mode) => {
      const built = components(build(name, mode));
      const cardVariants = (built.MuiCard?.variants ?? []) as Array<{
        props?: { variant?: string };
      }>;
      expect(
        cardVariants.some((v) => v?.props?.variant === 'grey'),
        "Base's MuiCard 'grey' variant was lost in the merge — variants must concatenate, not be replaced"
      ).toBe(true);
      if (name === 'sep') {
        expect(
          built.MuiButton?.variants?.length,
          "SEP's own MuiButton variants must land on top of Base's MuiButton styles"
        ).toBeGreaterThan(0);
      }
    });
  });
});
