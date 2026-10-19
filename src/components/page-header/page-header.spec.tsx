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

describe('PageHeader', () => {
  it('renders the title as the page h1 in the h2 style by default', () => {
    render(inTheme(<PageHeader title="MongoDB" />));

    const heading = screen.getByRole('heading', { level: 1, name: 'MongoDB' });
    expect(heading).toHaveClass('MuiTypography-h2');
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
    expect(root.children).toHaveLength(1);
    expect(root.firstElementChild?.children).toHaveLength(1);
    expect(root.firstElementChild?.firstElementChild?.tagName).toBe('H1');
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

  it('forwards the ref and the root props', () => {
    const ref = createRef<HTMLDivElement>();
    render(inTheme(<PageHeader ref={ref} title="MongoDB" data-testid="header" id="page-header" />));

    expect(ref.current).toBe(screen.getByTestId('header'));
    expect(ref.current).toHaveAttribute('id', 'page-header');
  });
});
