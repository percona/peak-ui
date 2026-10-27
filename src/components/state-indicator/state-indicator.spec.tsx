import { type ReactNode } from 'react';
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
  it.each<[StateIndicatorState, string, number]>([
    ['healthy', 'checkCircle', 20],
    ['mixedProblems', 'dangerous', 24],
    ['degraded', 'warning', 24],
    ['loading', 'cached', 20],
    ['errors', 'emergencyHome', 24],
    ['notSetUp', 'help', 20],
    ['information', 'chatInfo', 20],
    ['silenced', 'notificationsOff', 20],
  ])(
    'shows %s with the %s glyph from its %ipx grid at 24px, hidden from assistive technology',
    (state, glyph, size) => {
      renderInTheme(<StateIndicator state={state}>Label</StateIndicator>);

      const svg = glyphOf('Label');

      expect(svg).toHaveAttribute('data-glyph', glyph);
      expect(svg).toHaveAttribute('viewBox', `0 0 ${size} ${size}`);
      expect(svg).toHaveStyle({ width: '24px', height: '24px' });
      expect(svg?.parentElement).toHaveAttribute('aria-hidden', 'true');
    }
  );

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

  it('fills only mixed problems, with the error surface and its contrast text in bold', () => {
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
    expect(filled).toHaveStyle({ color: palette.error.contrastText, fontWeight: 700 });
    expect(screen.getByText('32 alerts firing')).not.toHaveStyle({ fontWeight: 700 });
    expect(screen.getByText('32 alerts firing').closest('[data-state]')).not.toHaveStyle({
      backgroundColor: palette.error.surface,
    });
  });

  it('passes other props to the root', () => {
    renderInTheme(
      <StateIndicator state="healthy" data-testid="health">
        All 14 clusters are healthy
      </StateIndicator>
    );

    expect(screen.getByTestId('health')).toHaveTextContent('All 14 clusters are healthy');
  });

  it('draws a small indicator’s problem icon at 20px, the label still body1', () => {
    const { typography } = themeFor();

    renderInTheme(
      <>
        <StateIndicator state="degraded">Data paused</StateIndicator>
        <StateIndicator state="degraded" size="small">
          Data paused, last update 4m ago
        </StateIndicator>
      </>
    );

    const glyph = (text: string) =>
      screen.getByText(text).closest('[data-state]')?.querySelector('[data-glyph]');
    expect(glyph('Data paused')).toHaveStyle({ width: '24px' });
    expect(glyph('Data paused, last update 4m ago')).toHaveStyle({ width: '20px' });
    expect(screen.getByText('Data paused, last update 4m ago')).toHaveStyle({
      fontSize: typography.body1.fontSize,
    });
  });
});
