import { type ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import ShortcutTile from '../shortcut-tile';
import ShortcutTiles from './shortcut-tiles';

const theme = createTheme(getThemeOptions('pmm')('light'));

const renderInTheme = (node: ReactNode) =>
  render(<ThemeProvider theme={theme}>{node}</ThemeProvider>);

const tile = (label: string) => (
  <ShortcutTile key={label} icon={<svg />} label={label} href={`/${label}`} />
);

// jsdom applies no container query, so read the rules Emotion wrote.
const styles = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent)
    .join('')
    .replace(/\s/g, '');

describe('ShortcutTiles', () => {
  it('lists one item per tile, in order', () => {
    renderInTheme(
      <ShortcutTiles>{['Clusters', 'Fleet', 'Query analytics'].map(tile)}</ShortcutTiles>
    );

    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items.map((item) => item.textContent)).toEqual(['Clusters', 'Fleet', 'Query analytics']);
    expect(within(items[1]).getByRole('link', { name: 'Fleet' })).toHaveAttribute('href', '/Fleet');
  });

  it('puts two tiles a line, three from 640px of its own width, and five once each cell gets 206px', () => {
    renderInTheme(<ShortcutTiles>{['A', 'B', 'C', 'D', 'E'].map(tile)}</ShortcutTiles>);

    const css = styles();

    expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
    expect(css).toMatch(
      /@container\(min-width:640px\)\{[^@]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/
    );
    expect(css).toMatch(
      /@container\(min-width:1030px\)\{[^@]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/
    );
  });

  it('waits for 206px a cell before putting six on one line', () => {
    renderInTheme(<ShortcutTiles>{['A', 'B', 'C', 'D', 'E', 'F'].map(tile)}</ShortcutTiles>);

    expect(styles()).toMatch(
      /@container\(min-width:1236px\)\{[^@]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/
    );
  });

  it('skips a tile that is not there, and shares the grid among the rest', () => {
    renderInTheme(
      <ShortcutTiles>
        {tile('Clusters')}
        {false}
        {tile('Query analytics')}
      </ShortcutTiles>
    );

    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    expect(styles()).toMatch(
      /@container\(min-width:412px\)\{[^@]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/
    );
  });

  it('rules every cell: no line right of a line’s last tile, none under the last line, the box open at the top', () => {
    renderInTheme(<ShortcutTiles>{['A', 'B', 'C', 'D', 'E'].map(tile)}</ShortcutTiles>);

    const css = styles();
    const list = getComputedStyle(screen.getByRole('list'));

    expect([
      list.borderTopWidth,
      list.borderRightWidth,
      list.borderBottomWidth,
      list.borderLeftWidth,
    ]).toEqual(['0px', '1px', '1px', '1px']);
    // Two a line: the second line starts at the fifth tile; three a line: at the fourth.
    expect(css).toMatch(/li:nth-of-type\(2n\)\{border-right-width:0/);
    expect(css).toMatch(/li:nth-of-type\(n\+5\)\{border-bottom-width:0/);
    expect(css).toMatch(
      /@container\(min-width:640px\)\{[^@]*li:nth-of-type\(3n\)\{border-right-width:0[^@]*li:nth-of-type\(n\+4\)\{border-bottom-width:0/
    );
  });
});
