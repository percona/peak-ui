import type { ReactNode, Ref, SyntheticEvent } from 'react';
import type { DialogProps } from '@mui/material/Dialog';
import type { InputBaseProps } from '@mui/material/InputBase';
import type { MatchRange } from '../text-highlight';

export interface SearchDialogItem {
  /** Unique across all groups. */
  id: string;
  /** The accessible name; put the distinguishing word first. */
  label: string;
  /** A second line; an array renders as a breadcrumb. */
  description?: string | readonly string[];
  /** Decorative, drawn at 24px. */
  icon?: ReactNode;
  /** Decorative trailing content; never interactive. */
  meta?: ReactNode;
  /** Shows an error icon; the item stays selectable, for retry rows. */
  status?: 'error';
  /** The label ranges to mark; `getMatchRanges(label, query)` by default. */
  labelRanges?: readonly MatchRange[];
}

export interface SearchDialogGroup<T extends SearchDialogItem = SearchDialogItem> {
  id: string;
  /** The visual overline heading; it also names the group for assistive technology. */
  label: string;
  /** Groups with no items are not drawn. */
  items: readonly T[];
}

export interface SearchDialogOptionState {
  highlighted: boolean;
  query: string;
}

export interface SearchDialogSelectDetails {
  /** True for ⌘ or Ctrl with Enter or a click, and for a middle click. */
  newTab: boolean;
  trigger: 'keyboard' | 'pointer';
  event: SyntheticEvent;
}

export type SearchDialogCloseReason = 'escapeKeyDown' | 'backdropClick' | 'closeButton';

export interface SearchDialogKeyHint {
  keys: readonly string[];
  label: string;
}

export interface SearchDialogLabels {
  /** The dialog's accessible name; 'Search' by default. */
  dialog: string;
  /** The input's accessible name; 'Search' by default. */
  input: string;
  /** The listbox's accessible name; 'Results' by default. */
  results: string;
  /** How to use the input, read as its description. */
  instructions: string;
  /** The clear button's accessible name; 'Clear search' by default. */
  clear: string;
  /** The full-screen close button's text; 'Close' by default. */
  close: string;
  /** The empty state's heading. */
  noResults: (query: string) => string;
  /** A line under the empty state's heading; none by default. */
  noResultsHint?: string;
}

export interface SearchDialogStatus {
  query: string;
  count: number;
  topLabel?: string;
  loading: boolean;
}

export interface SearchDialogProps<T extends SearchDialogItem = SearchDialogItem> {
  open: boolean;
  onClose: (event: object, reason: SearchDialogCloseReason) => void;
  /** The app filters, ranks, groups and caps the results for it; it also seeds the input on open. */
  query: string;
  /** Never called mid-composition; called once when a composition ends. */
  onQueryChange: (query: string) => void;
  groups: readonly SearchDialogGroup<T>[];
  /** Called on Enter or a click; the dialog never closes by itself. */
  onSelect: (item: T, details: SearchDialogSelectDetails) => void;
  /** Replaces an option's content; Peak UI keeps the `role="option"` element around it. */
  renderOption?: (item: T, state: SearchDialogOptionState) => ReactNode;
  placeholder?: string;
  labels?: Partial<SearchDialogLabels>;
  /** Sets `aria-busy` at once, and shows a spinner after `loadingDelay`. */
  loading?: boolean;
  /** Milliseconds before the spinner shows; 300 by default. */
  loadingDelay?: number;
  /** The text of the polite live region, announced 500ms after the results settle. */
  getStatusMessage?: (status: SearchDialogStatus) => string;
  /** Shown for a query with no results while not loading; replaces the default illustration and text. */
  emptyState?: ReactNode;
  /** The footer's hints, or false for none; ↑↓ Navigate, ↵ Open and Esc Close by default. */
  keyHints?: readonly SearchDialogKeyHint[] | false;
  /** Ctrl+N and Ctrl+P move to the next and previous result; off by default. */
  ctrlNavigation?: boolean;
  /** Width in px; 640 by default. */
  width?: number;
  /** The base of the generated ids. */
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  slotProps?: {
    dialog?: Partial<
      Omit<
        DialogProps,
        | 'open'
        | 'onClose'
        | 'children'
        | 'slots'
        | 'slotProps'
        | 'fullScreen'
        | 'maxWidth'
        | 'transitionDuration'
      >
    > & { [key: `data-${string}`]: string | undefined };
    input?: InputBaseProps['inputProps'];
  };
}

export interface SearchDialogOptionProps {
  label: string;
  description?: string | readonly string[];
  icon?: ReactNode;
  meta?: ReactNode;
  status?: 'error';
  query?: string;
  labelRanges?: readonly MatchRange[];
}
