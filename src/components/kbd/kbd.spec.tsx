import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import Kbd from './kbd';

const renderInTheme = (node: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme(getThemeOptions('pmm')('light'))}>{node}</ThemeProvider>
  );

describe('Kbd', () => {
  it('draws one cap for a single key', () => {
    const { container } = renderInTheme(<Kbd keys="Esc" data-testid="kbd" />);

    const root = screen.getByTestId('kbd');
    expect(root.tagName).toBe('KBD');
    expect(root.querySelectorAll('kbd')).toHaveLength(1);
    expect(container).toHaveTextContent('Esc');
  });

  it('draws one inner cap per key of a chord', () => {
    renderInTheme(<Kbd keys={['⌘', 'K']} data-testid="kbd" />);

    const caps = screen.getByTestId('kbd').querySelectorAll('kbd');
    expect(caps).toHaveLength(2);
    expect(caps[0].querySelector('svg')).not.toBeNull();
    expect(caps[1]).toHaveTextContent('K');
  });

  it.each([
    ['⌘', 'Command'],
    ['↑', 'Up arrow'],
    ['↵', 'Enter'],
  ])('draws %s as an icon that is read as %s', (key, name) => {
    renderInTheme(<Kbd keys={key} data-testid="kbd" />);

    const cap = screen.getByTestId('kbd').querySelector('kbd');
    expect(cap?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(cap).toHaveTextContent(name);
    expect(cap).not.toHaveTextContent(key);
  });

  it('reads only the label when a symbol chord has one', () => {
    renderInTheme(<Kbd keys={['⌘', 'K']} label="Command K" data-testid="kbd" />);

    expect(screen.getByTestId('kbd')).toHaveTextContent(/^KCommand K$/);
  });

  it('draws word keys as text', () => {
    renderInTheme(<Kbd keys="Esc" data-testid="kbd" />);

    const cap = screen.getByTestId('kbd').querySelector('kbd');
    expect(cap?.querySelector('svg')).toBeNull();
    expect(cap).toHaveTextContent('Esc');
  });

  it('hides the caps and exposes the spoken label instead', () => {
    renderInTheme(<Kbd keys={['⌘', 'K']} label="Command K" data-testid="kbd" />);

    const root = screen.getByTestId('kbd');
    root
      .querySelectorAll('kbd')
      .forEach((cap) => expect(cap).toHaveAttribute('aria-hidden', 'true'));
    expect(screen.getByText('Command K').tagName).toBe('SPAN');
  });

  it('leaves the caps exposed without a label', () => {
    renderInTheme(<Kbd keys={['Ctrl', 'K']} data-testid="kbd" />);

    screen
      .getByTestId('kbd')
      .querySelectorAll('kbd')
      .forEach((cap) => expect(cap).not.toHaveAttribute('aria-hidden'));
  });

  it('merges sx and passes other props to the outer element', () => {
    renderInTheme(<Kbd keys="K" aria-hidden sx={{ ml: 2 }} data-testid="kbd" />);

    const root = screen.getByTestId('kbd');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveStyle({ marginLeft: '16px', display: 'inline-flex' });
  });
});
