import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getThemeOptions } from '../../design';
import type { KeyboardShortcut } from '../kbd';
import SearchTrigger from './search-trigger';

const SHORTCUT: KeyboardShortcut = {
  keys: ['⌘', 'K'],
  text: '⌘K',
  spoken: 'Command K',
  ariaKeyShortcuts: 'Meta+K',
};

const theme = createTheme(getThemeOptions('pmm')('light'));
const inTheme = (node: ReactNode) => <ThemeProvider theme={theme}>{node}</ThemeProvider>;

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

describe('SearchTrigger', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is a button named by its label in both forms', () => {
    const { rerender } = render(inTheme(<SearchTrigger shortcut={SHORTCUT} />));

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Meta+K');

    rerender(inTheme(<SearchTrigger shortcut={SHORTCUT} collapsed />));

    expect(screen.getByRole('button', { name: 'Search' })).toBe(button);
  });

  it('is a NavItem row with the label as its text and the caps at its end', () => {
    render(inTheme(<SearchTrigger shortcut={SHORTCUT} />));

    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiListItemButton-root');
    expect(button.querySelector('.MuiListItemText-primary')).toHaveTextContent('Search');
    const caps = button.lastElementChild?.querySelectorAll('kbd kbd');
    expect(caps?.[0].querySelector('svg')).not.toBeNull();
    expect(caps?.[1]).toHaveTextContent('K');
  });

  it('is described by the spoken shortcut', () => {
    render(inTheme(<SearchTrigger shortcut={SHORTCUT} />));

    expect(screen.getByRole('button')).toHaveAccessibleDescription('Shortcut: Command K');
  });

  it('takes a custom description, and has none without a shortcut', () => {
    const { rerender } = render(
      inTheme(<SearchTrigger shortcut={SHORTCUT} shortcutDescription="Press Command K" />)
    );

    expect(screen.getByRole('button')).toHaveAccessibleDescription('Press Command K');

    rerender(inTheme(<SearchTrigger />));

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('merges a consumer aria-describedby and lets the consumer override aria-keyshortcuts', () => {
    render(
      inTheme(
        <>
          <span id="extra">Opens the search panel</span>
          <SearchTrigger
            shortcut={SHORTCUT}
            aria-describedby="extra"
            aria-keyshortcuts="Control+K"
          />
        </>
      )
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-describedby')).toMatch(/^extra \S+$/);
    expect(button).toHaveAccessibleDescription('Opens the search panel Shortcut: Command K');
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+K');
  });

  it('hides the icon and the caps from assistive technology', () => {
    render(inTheme(<SearchTrigger shortcut={SHORTCUT} />));

    const button = screen.getByRole('button');
    expect(button.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(button.querySelector('kbd')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows a tooltip with the shortcut when collapsed, without renaming the button', () => {
    vi.useFakeTimers();
    render(inTheme(<SearchTrigger shortcut={SHORTCUT} collapsed />));
    const button = screen.getByRole('button', { name: 'Search' });

    fireEvent.mouseOver(button);
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent('Search (⌘K)');
    expect(button).toHaveAccessibleName('Search');
    expect(button).toHaveAccessibleDescription('Shortcut: Command K');
    expect(button).not.toHaveAttribute('title');
  });

  it('shows no tooltip when expanded', () => {
    vi.useFakeTimers();
    render(inTheme(<SearchTrigger shortcut={SHORTCUT} />));
    const button = screen.getByRole('button');

    fireEvent.mouseOver(button);
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(button).not.toHaveAttribute('title');
  });

  it('hands over printable characters typed while focused', () => {
    const onTypeAhead = vi.fn();
    render(inTheme(<SearchTrigger shortcut={SHORTCUT} onTypeAhead={onTypeAhead} />));
    const button = screen.getByRole('button');

    expect(fireEvent.keyDown(button, { key: 'm' })).toBe(false);
    fireEvent.keyDown(button, { key: 'M', shiftKey: true });

    expect(onTypeAhead.mock.calls).toEqual([['m'], ['M']]);
  });

  it('ignores keys that are not plain characters', () => {
    const onTypeAhead = vi.fn();
    render(inTheme(<SearchTrigger onTypeAhead={onTypeAhead} />));
    const button = screen.getByRole('button');

    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyDown(button, { key: ' ' });
    fireEvent.keyDown(button, { key: 'k', metaKey: true });
    fireEvent.keyDown(button, { key: 'k', ctrlKey: true });
    fireEvent.keyDown(button, { key: 'x', altKey: true });
    fireEvent.keyDown(button, { key: 'n', keyCode: 229 });
    fireEvent.keyDown(button, { key: 'n', isComposing: true });
    fireEvent.keyDown(button, {});

    expect(onTypeAhead).not.toHaveBeenCalled();
  });

  it('runs the consumer onKeyDown first and respects its preventDefault', () => {
    const onTypeAhead = vi.fn();
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(inTheme(<SearchTrigger onTypeAhead={onTypeAhead} onKeyDown={onKeyDown} />));

    fireEvent.keyDown(screen.getByRole('button'), { key: 'm' });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onTypeAhead).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'outlines keyboard focus in Highlight under forced colors (collapsed: %s)',
    (collapsed) => {
      render(inTheme(<SearchTrigger shortcut={SHORTCUT} collapsed={collapsed} />));
      const button = screen.getByRole('button');

      expect(forcedColorsStyles(button)).toEqual([]);

      button.classList.add('Mui-focusVisible');

      expect(forcedColorsStyles(button)).toEqual([
        'outline: 2px solid highlight; outline-offset: -2px;',
      ]);
    }
  );

  it('calls onClick', () => {
    const onClick = vi.fn();
    render(inTheme(<SearchTrigger onClick={onClick} data-testid="trigger" />));

    fireEvent.click(screen.getByTestId('trigger'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
