import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import TextHighlight from './text-highlight';

const renderInTheme = (node: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme(getThemeOptions('pmm')('light'))}>{node}</ThemeProvider>
  );

const marks = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('mark')).map((mark) => mark.textContent);

describe('TextHighlight', () => {
  it('marks the word that starts with the query', () => {
    const { container } = renderInTheme(<TextHighlight text="Banana analytics" query="ana" />);

    expect(marks(container)).toEqual(['ana']);
    expect(container.querySelector('mark')?.nextSibling?.textContent).toBe('lytics');
    expect(container).toHaveTextContent('Banana analytics');
  });

  it('marks accented text at its original position', () => {
    const { container } = renderInTheme(<TextHighlight text="Médias sociaux" query="med soc" />);

    expect(marks(container)).toEqual(['Méd', 'soc']);
  });

  it('marks in bold without changing the colour', () => {
    const { container } = renderInTheme(
      <span style={{ color: 'rgb(1, 2, 3)' }}>
        <TextHighlight text="Overview" query="over" />
      </span>
    );

    expect(container.querySelector('mark')).toHaveStyle({
      fontWeight: '700',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      color: 'rgb(1, 2, 3)',
    });
  });

  it('renders plain text when nothing matches', () => {
    const { container } = renderInTheme(
      <TextHighlight text="Overview" query="xyz" data-testid="highlight" />
    );

    expect(container.querySelector('mark')).toBeNull();
    expect(screen.getByTestId('highlight').tagName).toBe('SPAN');
    expect(screen.getByTestId('highlight')).toHaveTextContent('Overview');
  });

  it('uses explicit ranges over the query', () => {
    const { container } = renderInTheme(
      <TextHighlight
        text="Query analytics"
        query="query"
        ranges={[
          [6, 9],
          [0, 1],
        ]}
      />
    );

    expect(marks(container)).toEqual(['Q', 'ana']);
  });
});
