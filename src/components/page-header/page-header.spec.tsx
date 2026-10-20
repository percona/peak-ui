import { createRef, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { getThemeOptions } from '../../design';
import Chip from '../chip';
import { PerconaMoIcon } from '../icons';
import PageHeader from './page-header';

const theme = createTheme(getThemeOptions('pmm')('light'));
const inTheme = (node: ReactNode) => <ThemeProvider theme={theme}>{node}</ThemeProvider>;

// jsdom does no layout, so read the declarations an at-rule would apply to the element.
const conditionalStyles = (element: Element, atRule: '@container' | '@media') =>
  [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .filter((rule): rule is CSSConditionRule => rule.cssText.startsWith(atRule))
    .flatMap((rule) =>
      [...rule.cssRules]
        .filter(
          (inner): inner is CSSStyleRule =>
            inner instanceof CSSStyleRule &&
            !inner.selectorText.includes('::') &&
            element.matches(inner.selectorText)
        )
        .map((inner) => ({ query: `${atRule} ${rule.conditionText}`, style: inner.style }))
    );

describe('PageHeader', () => {
  it('renders the title as the page h1 in the h3 style by default', () => {
    render(inTheme(<PageHeader title="MongoDB" />));

    const heading = screen.getByRole('heading', { level: 1, name: 'MongoDB' });
    expect(heading).toHaveClass('MuiTypography-h3');
  });

  it('respects titleComponent and titleVariant', () => {
    render(inTheme(<PageHeader title="Clusters" titleComponent="h2" titleVariant="h4" />));

    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    const heading = screen.getByRole('heading', { level: 2, name: 'Clusters' });
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveClass('MuiTypography-h4');
  });

  it('hides the icon from assistive technology and keeps the badge out of the heading', () => {
    render(
      inTheme(
        <PageHeader
          title="MongoDB"
          icon={<PerconaMoIcon data-testid="icon" />}
          badge={<Chip size="small" label="Sample data" />}
        />
      )
    );

    expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('MongoDB');
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  it('puts title, description, actions and toolbar in that DOM order', () => {
    render(
      inTheme(
        <PageHeader
          title="MongoDB"
          badge={<Chip size="small" label="Sample data" />}
          description="3 clusters"
          actions={<Button>Add service</Button>}
          toolbar={<Button>Refresh</Button>}
        />
      )
    );

    const order = [
      screen.getByRole('heading', { name: 'MongoDB' }),
      screen.getByText('Sample data'),
      screen.getByText('3 clusters'),
      screen.getByRole('button', { name: 'Add service' }),
      screen.getByRole('button', { name: 'Refresh' }),
    ];
    order.slice(1).forEach((node, i) => {
      expect(order[i].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
  });

  it('renders no wrapper for a slot that is not passed', () => {
    const { container } = render(
      inTheme(<PageHeader title="MongoDB" badge={false} description={null} />)
    );

    const root = container.firstElementChild as HTMLElement;
    const grid = root.firstElementChild as HTMLElement;
    expect(root.children).toHaveLength(1);
    expect(grid.children).toHaveLength(1);
    expect(grid.firstElementChild?.children).toHaveLength(1);
    expect(grid.firstElementChild?.firstElementChild?.tagName).toBe('H1');
  });

  it('stacks until the header itself is md wide, whatever the viewport', () => {
    const { container } = render(
      inTheme(
        <PageHeader
          title="MongoDB"
          description="3 clusters"
          actions={<Button>Add service</Button>}
          toolbar={<Button>Refresh</Button>}
        />
      )
    );

    const root = container.firstElementChild as HTMLElement;
    const grid = root.firstElementChild as HTMLElement;
    const actionsRow = screen.getByRole('button', { name: 'Add service' }).parentElement!;
    const wideQuery = theme.containerQueries.up('md');

    expect(getComputedStyle(root).getPropertyValue('container-type')).toBe('inline-size');
    expect(getComputedStyle(grid).gridTemplateAreas).toBe(
      '"title" "description" "actions" "toolbar"'
    );
    expect(getComputedStyle(actionsRow).justifyContent).toBe('flex-start');
    expect(conditionalStyles(grid, '@media')).toEqual([]);
    expect(conditionalStyles(actionsRow, '@media')).toEqual([]);

    const [wideGrid, ...otherGrid] = conditionalStyles(grid, '@container');
    expect(otherGrid).toEqual([]);
    expect(wideGrid.query).toBe(wideQuery);
    expect(wideGrid.style.getPropertyValue('grid-template-areas')).toBe(
      '"title actions" "description description" "toolbar toolbar"'
    );
    expect(
      conditionalStyles(actionsRow, '@container').map(({ query, style }) => [
        query,
        style.justifyContent,
      ])
    ).toEqual([[wideQuery, 'flex-end']]);
  });

  it('gives the actions at most half the row beside the title', () => {
    const { container } = render(
      inTheme(<PageHeader title="MongoDB" actions={<Button>Add service</Button>} />)
    );

    const grid = container.firstElementChild?.firstElementChild as HTMLElement;
    const [wideGrid] = conditionalStyles(grid, '@container');
    expect(wideGrid.style.getPropertyValue('grid-template-columns')).toBe(
      'minmax(0, 1fr) fit-content(50%)'
    );
  });

  it('sizes the title by its longest word, not by a single letter', () => {
    render(inTheme(<PageHeader title="MongoDB" />));

    expect(getComputedStyle(screen.getByRole('heading', { level: 1 })).overflowWrap).toBe(
      'break-word'
    );
  });

  it('renders the description as secondary body text', () => {
    render(inTheme(<PageHeader title="MongoDB" description="3 clusters" />));

    const description = screen.getByText('3 clusters');
    expect(description).toHaveClass('MuiTypography-body1');
    expect(description).toHaveStyle({ color: theme.palette.text.secondary });
  });

  it('leaves the controls it is given as they are', () => {
    const onAdd = vi.fn();
    const onRefresh = vi.fn();
    render(
      inTheme(
        <PageHeader
          title="MongoDB"
          actions={<Button onClick={onAdd}>Add service</Button>}
          toolbar={<Button onClick={onRefresh}>Refresh</Button>}
        />
      )
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add service' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('puts an inline toolbar on the title row, before the actions, once the header is md wide', () => {
    const { container } = render(
      inTheme(
        <PageHeader
          title="MongoDB"
          description="3 clusters"
          actions={<Button>Add MongoDB</Button>}
          toolbar={<Button>Refresh</Button>}
          toolbarPlacement="inline"
        />
      )
    );

    const grid = container.firstElementChild?.firstElementChild as HTMLElement;
    const [wideGrid] = conditionalStyles(grid, '@container');

    expect(getComputedStyle(grid).gridTemplateAreas).toBe(
      '"title" "description" "toolbar" "actions"'
    );
    expect(wideGrid.style.getPropertyValue('grid-template-areas')).toBe(
      '"title toolbar actions" "description description description"'
    );
    expect(wideGrid.style.getPropertyValue('grid-template-columns')).toBe(
      'auto minmax(0, 1fr) auto'
    );
    expect(wideGrid.style.getPropertyValue('align-items')).toBe('center');

    const refresh = screen.getByRole('button', { name: 'Refresh' });
    const add = screen.getByRole('button', { name: 'Add MongoDB' });
    expect(refresh.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('keeps the toolbar below without the inline placement, and without a toolbar ignores it', () => {
    const { container } = render(inTheme(<PageHeader title="MongoDB" toolbarPlacement="inline" />));

    const grid = container.firstElementChild?.firstElementChild as HTMLElement;
    const [wideGrid] = conditionalStyles(grid, '@container');
    expect(wideGrid.style.getPropertyValue('grid-template-areas')).toBe('"title"');
    expect(wideGrid.style.getPropertyValue('grid-template-columns')).toBe('minmax(0, 1fr)');
  });

  it('draws a divider under the header when asked', () => {
    const { container, rerender } = render(inTheme(<PageHeader title="MongoDB" divider />));
    const root = container.firstElementChild as HTMLElement;

    expect(getComputedStyle(root).borderBottom).toContain('1px solid');
    rerender(inTheme(<PageHeader title="MongoDB" />));
    expect(getComputedStyle(container.firstElementChild as HTMLElement).borderBottomStyle).not.toBe(
      'solid'
    );
  });

  it('forwards the ref and the root props', () => {
    const ref = createRef<HTMLDivElement>();
    render(inTheme(<PageHeader ref={ref} title="MongoDB" data-testid="header" id="page-header" />));

    expect(ref.current).toBe(screen.getByTestId('header'));
    expect(ref.current).toHaveAttribute('id', 'page-header');
  });
});
