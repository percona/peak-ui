import type { BoxProps } from '@mui/material/Box';

/** A platform-resolved shortcut; the app builds it, Peak UI only renders it. */
export interface KeyboardShortcut {
  /** The caps in order, such as `['⌘', 'K']` or `['Ctrl', 'K']`. */
  keys: readonly string[];
  /** Compact plain text, such as `'⌘K'` or `'Ctrl+K'`. */
  text: string;
  /** The spoken form, such as `'Command K'`. */
  spoken: string;
  /** The `aria-keyshortcuts` value, such as `'Meta+K'`. */
  ariaKeyShortcuts: string;
}

export interface KbdProps extends Omit<BoxProps<'kbd'>, 'children' | 'ref'> {
  /** One cap per entry: a single key, or the keys of a chord in order. */
  keys: string | readonly string[];
  /** The spoken form, such as "Command K": the caps are hidden from assistive technology and this is read instead. */
  label?: string;
}
