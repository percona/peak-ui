import { forwardRef, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider, type PaletteMode } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import StateIndicator from './state-indicator';
import type { StateIndicatorState } from './state-indicator.types';

const themeFor = (mode: PaletteMode = 'light') => createTheme(getThemeOptions('pmm')(mode));

const renderInTheme = (node: ReactNode, mode: PaletteMode = 'light') =>
  render(<ThemeProvider theme={themeFor(mode)}>{node}</ThemeProvider>);

const glyphOf = (label: string) =>
  screen.getByText(label).closest('[data-state]')?.querySelector('svg') ?? null;

describe('StateIndicator', () => {
  it.each<[StateIndicatorState, string]>([
    ['healthy', 'checkCircle'],
    ['mixedProblems', 'dangerous'],
    ['degraded', 'warning'],
    ['loading', 'cached'],
    ['errors', 'emergencyHome'],
    ['notSetUp', 'help'],
    ['information', 'chatInfo'],
    ['silenced', 'notificationsOff'],
  ])('shows %s with the %s glyph, hidden from assistive technology', (state, glyph) => {
    renderInTheme(<StateIndicator state={state}>Label</StateIndicator>);

    const svg = glyphOf('Label');

    expect(svg).toHaveAttribute('data-glyph', glyph);
    expect(svg?.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows the default state as secondary text without an icon', () => {
    const theme = themeFor();

    renderInTheme(<StateIndicator state="default">No alerts firing</StateIndicator>);

    expect(glyphOf('No alerts firing')).toBeNull();
    expect(screen.getByText('No alerts firing')).toHaveStyle({
      color: theme.palette.text.secondary,
    });
  });

  it.each<[PaletteMode]>([['light'], ['dark']])('colors each state from the %s palette', (mode) => {
    const { palette } = themeFor(mode);

    renderInTheme(
      <>
        <StateIndicator state="healthy">Healthy</StateIndicator>
        <StateIndicator state="degraded">Degraded</StateIndicator>
        <StateIndicator state="errors">Errors</StateIndicator>
        <StateIndicator state="silenced">Silenced</StateIndicator>
      </>,
      mode
    );

    expect(glyphOf('Healthy')?.parentElement).toHaveStyle({ color: palette.success.light });
    expect(glyphOf('Degraded')?.parentElement).toHaveStyle({ color: palette.warning.light });
    expect(glyphOf('Errors')?.parentElement).toHaveStyle({ color: palette.error.light });
    expect(screen.getByText('Errors')).toHaveStyle({ color: palette.text.primary });
    expect(screen.getByText('Silenced')).toHaveStyle({ color: palette.text.secondary });
  });

  it('fills only mixed problems, with the error surface and its contrast text', () => {
    const { palette } = themeFor('dark');

    renderInTheme(
      <>
        <StateIndicator state="mixedProblems">2 of 14 clusters need attention</StateIndicator>
        <StateIndicator state="errors">32 alerts firing</StateIndicator>
      </>,
      'dark'
    );

    const filled = screen.getByText('2 of 14 clusters need attention');

    expect(filled.closest('[data-state]')).toHaveStyle({
      backgroundColor: palette.error.surface,
    });
    expect(filled).toHaveStyle({ color: palette.error.contrastText });
    expect(screen.getByText('32 alerts firing').closest('[data-state]')).not.toHaveStyle({
      backgroundColor: palette.error.surface,
    });
  });

  it('renders actionable as an underlined link without an icon', () => {
    renderInTheme(
      <StateIndicator state="actionable" href="/alerting/new">
        Set up alerts
      </StateIndicator>
    );

    const link = screen.getByRole('link', { name: 'Set up alerts' });

    expect(link).toHaveAttribute('href', '/alerting/new');
    expect(link).toHaveClass('MuiLink-underlineAlways');
    expect(link.querySelector('svg')).toBeNull();
  });

  it('renders actionable through a router link component', () => {
    const RouterLink = forwardRef<HTMLAnchorElement, { to: string; children?: ReactNode }>(
      ({ to, ...props }, ref) => <a ref={ref} href={`/app${to}`} {...props} />
    );

    RouterLink.displayName = 'RouterLink';

    renderInTheme(
      <StateIndicator state="actionable" component={RouterLink} to="/backups/new">
        Set up backups
      </StateIndicator>
    );

    expect(screen.getByRole('link', { name: 'Set up backups' })).toHaveAttribute(
      'href',
      '/app/backups/new'
    );
  });

  it('passes other props to the root', () => {
    renderInTheme(
      <StateIndicator state="healthy" data-testid="health">
        All 14 clusters are healthy
      </StateIndicator>
    );

    expect(screen.getByTestId('health')).toHaveTextContent('All 14 clusters are healthy');
  });
});
