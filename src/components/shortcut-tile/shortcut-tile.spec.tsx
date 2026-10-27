import { forwardRef, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import ShortcutTile from './shortcut-tile';

const renderInTheme = (node: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme(getThemeOptions('pmm')('light'))}>{node}</ThemeProvider>
  );

const Icon = () => <svg data-testid="icon" />;

describe('ShortcutTile', () => {
  it('is a link named by its label, with the icon left out of the name', () => {
    renderInTheme(<ShortcutTile icon={<Icon />} label="Query analytics" href="/qan" />);

    const link = screen.getByRole('link', { name: 'Query analytics' });

    expect(link).toHaveAttribute('href', '/qan');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders through a router link component with its own props', () => {
    const RouterLink = forwardRef<HTMLAnchorElement, { to: string; children?: ReactNode }>(
      ({ to, ...rest }, ref) => <a ref={ref} href={`/app${to}`} {...rest} />
    );
    RouterLink.displayName = 'RouterLink';

    renderInTheme(
      <ShortcutTile icon={<Icon />} label="Fleet" component={RouterLink} to="/operations" />
    );

    expect(screen.getByRole('link', { name: 'Fleet' })).toHaveAttribute('href', '/app/operations');
  });

  it('describes where the place sits in a tooltip', async () => {
    renderInTheme(
      <ShortcutTile
        icon={<Icon />}
        label="Fleet"
        tooltip="Apps › Operations for MongoDB › Fleet"
        href="/operations"
      />
    );

    fireEvent.mouseOver(screen.getByRole('link', { name: 'Fleet' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Apps › Operations for MongoDB › Fleet'
    );
    expect(screen.getByRole('link', { name: 'Fleet' })).toHaveAccessibleDescription(
      'Apps › Operations for MongoDB › Fleet'
    );
  });
});
