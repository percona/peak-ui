import type { ReactNode } from 'react';
import type { ListItemButtonProps } from '@mui/material/ListItemButton';
import type { TooltipProps } from '@mui/material/Tooltip';
import type { KeyboardShortcut } from '../kbd';

export interface SearchTriggerProps extends Omit<
  ListItemButtonProps<'button'>,
  | 'children'
  | 'ref'
  | 'component'
  | 'selected'
  | 'disableGutters'
  | 'dense'
  | 'divider'
  | 'alignItems'
> {
  /** Visible text and accessible name in both forms; 'Search' by default. */
  label?: string;
  /** Drawn as trailing caps, and used for `aria-keyshortcuts`, the description and the collapsed tooltip. */
  shortcut?: KeyboardShortcut;
  /** The button's description; `Shortcut: <shortcut.spoken>` by default. */
  shortcutDescription?: string;
  /** The icon-only form for a sidebar rail; the same element, so toggling it animates rather than remounts. */
  collapsed?: boolean;
  /** Leading icon, drawn at 24px like a NavItem's; a search icon by default. */
  icon?: ReactNode;
  /** Timing of the change between forms; the theme's `shorter` duration and `easeInOut` easing by default. */
  morphTransition?: { duration: number; easing?: string };
  /** Where the collapsed form's tooltip opens; 'right' by default. */
  tooltipPlacement?: TooltipProps['placement'];
  /** Called with a printable character typed while the trigger has focus, to open search with it. */
  onTypeAhead?: (text: string) => void;
}
