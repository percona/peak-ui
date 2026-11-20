import { createRef, type ReactNode } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getThemeOptions } from '../../design';
import SearchDialog from './search-dialog';
import type { SearchDialogGroup, SearchDialogItem, SearchDialogProps } from './search-dialog.types';

const theme = createTheme(getThemeOptions('pmm')('light'));
const inTheme = (node: ReactNode) => <ThemeProvider theme={theme}>{node}</ThemeProvider>;

const GROUPS: SearchDialogGroup[] = [
  {
    id: 'pages',
    label: 'Pages',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'reports', label: 'Reports', description: ['Analytics', 'Reports'] },
      { id: 'users', label: 'Users' },
    ],
  },
  { id: 'empty', label: 'Empty', items: [] },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'invite', label: 'Invite a user' },
      { id: 'retry', label: "Couldn't load reports", status: 'error' },
    ],
  },
];
const ITEMS = GROUPS.flatMap((group) => group.items);
const LAST = ITEMS.length - 1;

type Props = Partial<SearchDialogProps<SearchDialogItem>>;

const renderDialog = (props: Props = {}) => {
  const handlers = { onClose: vi.fn(), onQueryChange: vi.fn(), onSelect: vi.fn() };
  const element = (next: Props) => (
    <SearchDialog open query="" groups={GROUPS} {...handlers} {...props} {...next} />
  );
  const view = render(inTheme(element({})));

  return {
    ...handlers,
    rerender: (next: Props) => view.rerender(inTheme(element(next))),
    input: screen.getByRole('combobox') as HTMLInputElement,
  };
};

const options = () => screen.getAllByRole('option');
const activeDescendant = (input: HTMLElement) => input.getAttribute('aria-activedescendant');
const highlighted = () => options().filter((option) => option.hasAttribute('data-highlighted'));

// The declarations of forced-colors rules that match the element, which jsdom never applies.
const forcedColorsStyles = (element: Element) =>
  Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules))
    .filter(
      (rule): rule is CSSMediaRule =>
        rule instanceof CSSMediaRule && rule.media.mediaText.includes('forced-colors')
    )
    .flatMap((rule) => Array.from(rule.cssRules))
    .filter(
      (rule): rule is CSSStyleRule =>
        rule instanceof CSSStyleRule && element.matches(rule.selectorText)
    )
    .map((rule) => rule.style.cssText.toLowerCase());

const stubMatchMedia = (matches: (query: string) => boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
};

describe('SearchDialog', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('is a modal dialog named by its label', () => {
    renderDialog({ labels: { dialog: 'Search the docs' } });

    const dialog = screen.getByRole('dialog', { name: 'Search the docs' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
  });

  it('gives the input the combobox attributes', () => {
    const { input, rerender } = renderDialog({ groups: [], placeholder: 'Search pages' });

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAccessibleName('Search');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('placeholder', 'Search pages');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('enterkeyhint', 'go');
    expect(input).toHaveAccessibleDescription(
      'Type to search. Use the up and down arrow keys to browse results, and Enter to open one.'
    );
    expect(input).toHaveAttribute('aria-expanded', 'false');

    const listbox = screen.getByRole('listbox', { hidden: true });
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(listbox).toHaveAttribute('hidden');
    expect(screen.queryByRole('listbox')).toBeNull();

    rerender({ groups: GROUPS });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Results' })).not.toHaveAttribute('hidden');
  });

  it('nests options directly in groups named by their headings, and skips empty groups', () => {
    renderDialog();

    const listbox = screen.getByRole('listbox');
    const groups = within(listbox).getAllByRole('group');
    expect(groups.map((group) => group.parentElement?.getAttribute('role'))).toEqual([
      'presentation',
      'presentation',
    ]);
    expect(
      Array.from(listbox.children).every((child) => child.getAttribute('role') === 'presentation')
    ).toBe(true);
    expect(within(listbox).getByRole('group', { name: 'Pages' })).toBe(groups[0]);
    expect(within(listbox).getByRole('group', { name: 'Actions' })).toBe(groups[1]);
    expect(within(listbox).queryByText('Empty')).toBeNull();
    groups.forEach((group) =>
      Array.from(group.children).forEach((child) => expect(child).toHaveAttribute('role', 'option'))
    );
    expect(options().map((option) => option.textContent)).toEqual([
      'Overview',
      'ReportsAnalytics, › Reports',
      'Users',
      'Invite a user',
      "Couldn't load reports",
    ]);
  });

  it("keeps group headings in the flow, and scrolls a group's first row in with its heading", () => {
    renderDialog();

    const listbox = screen.getByRole('listbox');
    const headings = listbox.querySelectorAll('.MuiListSubheader-root');
    headings.forEach((heading) => expect(getComputedStyle(heading).position).not.toBe('sticky'));

    const [firstGroup] = screen.getAllByRole('group');
    const [first, second] = within(firstGroup).getAllByRole('option');
    expect(getComputedStyle(first).scrollMarginTop).toBe('32px');
    expect(getComputedStyle(second).scrollMarginTop).not.toBe('32px');
  });

  it('highlights the first option without making it active, and Enter opens it', () => {
    const { input, onSelect } = renderDialog();

    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(highlighted()).toEqual([options()[0]]);
    options().forEach((option) => expect(option).toHaveAttribute('aria-selected', 'false'));

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      ITEMS[0],
      expect.objectContaining({ newTab: false, trigger: 'keyboard' })
    );
  });

  it('moves with the arrow keys and wraps round', () => {
    const { input } = renderDialog();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeDescendant(input)).toBe(options()[0].id);
    expect(options()[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(activeDescendant(input)).toBe(options()[LAST].id);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeDescendant(input)).toBe(options()[0].id);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeDescendant(input)).toBe(options()[1].id);
    expect(highlighted()).toEqual([options()[1]]);
    expect(options()[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('goes to the last option with ArrowUp from none', () => {
    const { input } = renderDialog();

    expect(fireEvent.keyDown(input, { key: 'ArrowUp' })).toBe(false);

    expect(activeDescendant(input)).toBe(options()[LAST].id);
  });

  it('pages by eight, clamped, and jumps to the ends', () => {
    const { input } = renderDialog();

    fireEvent.keyDown(input, { key: 'PageDown' });
    expect(activeDescendant(input)).toBe(options()[LAST].id);

    fireEvent.keyDown(input, { key: 'PageUp' });
    expect(activeDescendant(input)).toBe(options()[0].id);

    fireEvent.keyDown(input, { key: 'End', ctrlKey: true });
    expect(activeDescendant(input)).toBe(options()[LAST].id);

    fireEvent.keyDown(input, { key: 'Home', ctrlKey: true });
    expect(activeDescendant(input)).toBe(options()[0].id);

    fireEvent.keyDown(input, { key: 'ArrowDown', metaKey: true });
    expect(activeDescendant(input)).toBe(options()[LAST].id);

    fireEvent.keyDown(input, { key: 'ArrowUp', metaKey: true });
    expect(activeDescendant(input)).toBe(options()[0].id);
  });

  it('leaves Home, End and text selection keys to the input', () => {
    const { input } = renderDialog();

    expect(fireEvent.keyDown(input, { key: 'Home' })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'End' })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'ArrowDown', ctrlKey: true })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'ArrowUp', ctrlKey: true })).toBe(true);

    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('moves with Ctrl+N and Ctrl+P only with ctrlNavigation', () => {
    const { input, rerender } = renderDialog();

    expect(fireEvent.keyDown(input, { key: 'n', ctrlKey: true })).toBe(true);
    expect(input).not.toHaveAttribute('aria-activedescendant');

    rerender({ ctrlNavigation: true });

    fireEvent.keyDown(input, { key: 'n', ctrlKey: true });
    expect(activeDescendant(input)).toBe(options()[0].id);

    fireEvent.keyDown(input, { key: 'n', ctrlKey: true });
    expect(activeDescendant(input)).toBe(options()[1].id);

    fireEvent.keyDown(input, { key: 'p', ctrlKey: true });
    fireEvent.keyDown(input, { key: 'p', ctrlKey: true });
    expect(activeDescendant(input)).toBe(options()[LAST].id);
  });

  it('asks for a new tab with ⌘ or Ctrl and Enter or a click, and with a middle click', () => {
    const { input, onSelect } = renderDialog();

    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
    fireEvent.click(options()[1], { metaKey: true });
    fireEvent.click(options()[2]);
    fireEvent(
      options()[3],
      new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 })
    );
    fireEvent(
      options()[3],
      new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 2 })
    );

    expect(
      onSelect.mock.calls.map(([item, details]) => [item.id, details.newTab, details.trigger])
    ).toEqual([
      ['overview', true, 'keyboard'],
      ['overview', true, 'keyboard'],
      ['reports', true, 'pointer'],
      ['users', false, 'pointer'],
      ['invite', true, 'pointer'],
    ]);
  });

  it('outlines only the highlighted option, in Highlight under forced colors', () => {
    renderDialog();
    const [first, second] = options();

    expect(first).toHaveStyle({ outline: '2px solid transparent', outlineOffset: '-2px' });
    expect(second).not.toHaveStyle({ outline: '2px solid transparent' });
    expect(forcedColorsStyles(first)).toEqual(['outline-color: highlight;']);
    expect(forcedColorsStyles(second)).toEqual([]);
  });

  it('keeps focus in the input when an option is pressed', () => {
    const { input } = renderDialog();

    expect(fireEvent.mouseDown(options()[2])).toBe(false);
    expect(input).toHaveFocus();
  });

  it('highlights on pointer move without setting the active descendant', () => {
    const { input, onSelect } = renderDialog();

    fireEvent.pointerMove(options()[2]);

    expect(highlighted()).toEqual([options()[2]]);
    expect(options()[2]).toHaveAttribute('aria-selected', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(
      ITEMS[2],
      expect.objectContaining({ trigger: 'keyboard' })
    );

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeDescendant(input)).toBe(options()[3].id);
  });

  it('closes on Escape and on a backdrop click', () => {
    const { input, onClose } = renderDialog();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenLastCalledWith(expect.anything(), 'escapeKeyDown');

    const container = document.querySelector('.MuiDialog-container')!;
    fireEvent.mouseDown(container);
    fireEvent.click(container);
    expect(onClose).toHaveBeenLastCalledWith(expect.anything(), 'backdropClick');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('ignores Escape while composing', () => {
    const { input, onClose } = renderDialog();

    fireEvent.keyDown(input, { key: 'Escape', keyCode: 229, which: 229 });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('fills the screen on small screens, with a close button', () => {
    stubMatchMedia((query) => query.includes('max-width'));
    const { onClose } = renderDialog({ labels: { close: 'Done' } });

    expect(document.querySelector('.MuiDialog-paperFullScreen')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(onClose).toHaveBeenCalledWith(expect.anything(), 'closeButton');
  });

  it('has no close button on larger screens', () => {
    renderDialog();

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('emits typed queries once each', () => {
    const { input, onQueryChange } = renderDialog();

    fireEvent.change(input, { target: { value: 'rep' } });
    fireEvent.input(input, { target: { value: 'rep' } });

    expect(onQueryChange.mock.calls).toEqual([['rep']]);
  });

  it('clears through the parent and refocuses the input', () => {
    const { input, onQueryChange, rerender } = renderDialog({ query: 'rep' });
    expect(input.value).toBe('rep');

    const clear = screen.getByRole('button', { name: 'Clear search' });
    clear.focus();
    fireEvent.click(clear);

    expect(onQueryChange).toHaveBeenCalledWith('');
    expect(input).toHaveFocus();

    rerender({ query: '' });

    expect(input.value).toBe('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();

    fireEvent.change(input, { target: { value: 'rep' } });
    expect(onQueryChange).toHaveBeenLastCalledWith('rep');
  });

  it('outlines the focused clear and close buttons in Highlight under forced colors', () => {
    stubMatchMedia((query) => query.includes('max-width'));
    renderDialog({ query: 'rep' });
    const clear = screen.getByRole('button', { name: 'Clear search' });
    const close = screen.getByRole('button', { name: 'Close' });

    expect(forcedColorsStyles(clear)).toEqual([]);
    expect(forcedColorsStyles(close)).toEqual([]);

    clear.classList.add('Mui-focusVisible');
    close.classList.add('Mui-focusVisible');

    expect(forcedColorsStyles(clear)).toEqual([
      'outline: 2px solid highlight; outline-offset: -2px;',
    ]);
    expect(forcedColorsStyles(close)).toEqual([
      'outline: 2px solid highlight; outline-offset: -2px;',
    ]);
  });

  it('has no clear button for an empty query', () => {
    renderDialog();

    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('resets the active option when the query changes', () => {
    const { input, rerender } = renderDialog({ query: 'r' });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeDescendant(input)).toBe(options()[1].id);

    rerender({ query: 're' });

    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(highlighted()).toEqual([options()[0]]);

    rerender({ query: 'r' });

    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(highlighted()).toEqual([options()[0]]);
  });

  it('does not bring back an option chosen under an earlier query', () => {
    const { input, onSelect, rerender } = renderDialog({ query: 're' });

    fireEvent.pointerMove(options()[2]);
    rerender({ query: 'rep' });
    rerender({ query: 're' });

    expect(highlighted()).toEqual([options()[0]]);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    rerender({ query: 'rep' });
    rerender({ query: 're' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(onSelect).toHaveBeenCalledWith(ITEMS[0], expect.anything());
  });

  it('keeps the active option by id when groups are added', () => {
    const { input, rerender } = renderDialog();
    const extra: SearchDialogGroup = {
      id: 'help',
      label: 'Help',
      items: [{ id: 'docs', label: 'Documentation' }],
    };

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    rerender({ groups: [...GROUPS, extra] });
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent('Reports');

    rerender({ groups: [extra, ...GROUPS] });
    const active = screen.getByRole('option', { selected: true });
    expect(active).toHaveTextContent('Reports');
    expect(activeDescendant(input)).toBe(active.id);
  });

  it('drops the active option when it leaves the results', () => {
    const { input, rerender } = renderDialog();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    rerender({ groups: [{ ...GROUPS[0], items: [ITEMS[0], ITEMS[2]] }] });

    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(highlighted()).toEqual([options()[0]]);

    rerender({ groups: GROUPS });

    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(highlighted()).toEqual([options()[0]]);
  });

  it('announces the results 500ms after they settle', () => {
    vi.useFakeTimers();
    const { rerender } = renderDialog({ query: 'r' });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('');

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(status).toHaveTextContent('');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(status).toHaveTextContent('5 results. Top result: Overview.');

    rerender({ query: 'us', groups: [{ ...GROUPS[0], items: [ITEMS[2]] }] });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(status).toHaveTextContent('1 result: Users.');

    rerender({ query: 'xyz', groups: [] });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(status).toHaveTextContent('No results for “xyz”.');

    rerender({ query: 'xyz', groups: [], getStatusMessage: ({ count }) => `Found ${count}` });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(status).toHaveTextContent('Found 0');
  });

  it('announces nothing for an empty query, or while loading with no results', () => {
    vi.useFakeTimers();
    const { rerender } = renderDialog();
    const status = screen.getByRole('status');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(status).toHaveTextContent('');

    rerender({ query: 'xyz', groups: [], loading: true });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(status).toHaveTextContent('');
  });

  it('shows the empty state only for a query with no results while not loading', () => {
    const { rerender } = renderDialog({
      groups: [],
      labels: { noResultsHint: 'Try a broader term.' },
    });
    expect(screen.queryByText(/No results/)).toBeNull();

    rerender({ query: 'xyz', groups: [], loading: true });
    expect(screen.queryByText(/No results/)).toBeNull();

    rerender({ query: 'xyz', groups: [] });
    expect(screen.getByText('No results for “xyz”')).toHaveClass('MuiTypography-sectionHeading');
    expect(screen.getByText('Try a broader term.')).toBeInTheDocument();

    rerender({ query: 'xyz', groups: [], emptyState: <p>Nothing here</p> });
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByText(/No results/)).toBeNull();
  });

  it('sets aria-busy at once and shows the spinner after the loading delay', () => {
    vi.useFakeTimers();
    const { rerender } = renderDialog({ query: 'r', loading: true });
    const spinner = () => document.querySelector('.MuiCircularProgress-root');

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(spinner()).toBeNull();

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(spinner()).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(spinner()).toHaveAttribute('aria-hidden', 'true');

    rerender({ query: 'r', loading: false });
    expect(spinner()).toBeNull();
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-busy');

    rerender({ query: 'r', loading: true });
    expect(spinner()).toBeNull();
  });

  it('ignores Enter while composing, and emits a composed query once', () => {
    const { input, onQueryChange, onSelect } = renderDialog();

    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: 'に' }, isComposing: true });
    fireEvent.input(input, { target: { value: 'にほ' }, isComposing: true });
    expect(onQueryChange).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    fireEvent.input(input, { target: { value: 'にほ' } });

    expect(onQueryChange.mock.calls).toEqual([['にほ']]);
  });

  it('opens focused, with a seeded query and the caret after it', () => {
    const { input } = renderDialog({ query: 'm' });

    expect(input).toHaveFocus();
    expect(input.value).toBe('m');
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(1);
  });

  it('starts afresh when it reopens during the exit fade', () => {
    vi.useFakeTimers();
    const { rerender } = renderDialog({
      query: 'r',
      slotProps: { dialog: { disableRestoreFocus: true } },
    });
    render(<button type="button">Opener</button>);
    const opener = screen.getByText('Opener');
    const first = screen.getByRole('combobox');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(screen.getByRole('status')).toHaveTextContent('5 results. Top result: Overview.');

    rerender({ open: false, query: 'r' });
    act(() => opener.focus());
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(first).toBeInTheDocument();

    rerender({ open: true, query: 'r' });

    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input).toHaveFocus();
    expect(input).not.toBe(first);
    expect(input.selectionStart).toBe(1);
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('writes a query changed by the parent into the input', () => {
    const { input, rerender } = renderDialog({ query: 'm' });

    rerender({ query: 'mysql' });

    expect(input.value).toBe('mysql');
  });

  it('lets renderOption replace the content inside the option element', () => {
    renderDialog({
      renderOption: (item, { highlighted: isHighlighted, query }) => (
        <span>{`${item.label}${isHighlighted ? ' (highlighted)' : ''}${query}`}</span>
      ),
      query: '!',
    });

    expect(options()).toHaveLength(ITEMS.length);
    expect(options()[0]).toHaveTextContent('Overview (highlighted)!');
    expect(options()[1]).toHaveTextContent(/^Reports!$/);
  });

  it('keeps an error row selectable', () => {
    const { onSelect } = renderDialog();
    const retry = options()[LAST];

    expect(within(retry).getByTestId('ErrorOutlineOutlinedIcon')).toBeInTheDocument();

    fireEvent.click(retry);

    expect(onSelect).toHaveBeenCalledWith(
      ITEMS[LAST],
      expect.objectContaining({ trigger: 'pointer' })
    );
  });

  it('draws the key hints in a footer hidden from assistive technology', () => {
    const { rerender } = renderDialog();

    const footer = screen.getByText('Navigate').closest('[aria-hidden="true"]');
    expect(footer).toHaveTextContent('Up arrowDown arrowNavigateEnterOpenEscClose');
    expect(footer?.querySelectorAll('svg')).toHaveLength(3);

    rerender({ keyHints: [{ keys: ['Tab'], label: 'Next field' }] });
    expect(screen.getByText('Next field')).toBeInTheDocument();
    expect(screen.queryByText('Navigate')).toBeNull();

    rerender({ keyHints: false });
    expect(screen.queryByText('Next field')).toBeNull();
  });

  it('passes dialog and input slot props through, and forwards the input ref', () => {
    const inputRef = createRef<HTMLInputElement>();
    renderDialog({
      inputRef,
      id: 'site-search',
      slotProps: {
        dialog: { 'data-testid': 'search-dialog', disableRestoreFocus: true },
        input: { 'data-testid': 'search-input' },
      },
    });

    const root = screen.getByTestId('search-dialog');
    expect(root).toHaveClass('MuiDialog-root');
    expect(within(root).getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBe(inputRef.current);
    expect(screen.getByRole('listbox')).toHaveAttribute('id', 'site-search-listbox');
    expect(options()[0]).toHaveAttribute('id', 'site-search-option-0');
  });

  it('runs a consumer onKeyDown on the input first', () => {
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const { input, onSelect } = renderDialog({ slotProps: { input: { onKeyDown } } });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
