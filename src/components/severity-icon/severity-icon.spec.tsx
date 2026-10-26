import { type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import SeverityIcon from './severity-icon';
import type { SeverityIconSeverity } from './severity-icon.types';

const renderInTheme = (node: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme(getThemeOptions('pmm')('light'))}>{node}</ThemeProvider>
  );

describe('SeverityIcon', () => {
  it.each<[SeverityIconSeverity, string]>([
    ['critical', 'M8.25 21L3 15.75'],
    ['error', 'M11.2375 21.875'],
    ['warning', 'M1 21L12 2'],
  ])(
    'draws %s with the State indicator’s glyph, hidden from assistive technology',
    (severity, path) => {
      const { container } = renderInTheme(<SeverityIcon severity={severity} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('data-severity', severity);
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg?.querySelector('path')?.getAttribute('d')).toMatch(new RegExp(`^${path}`));
    }
  );

  it('is 24px by default and 20px when small', () => {
    const { container } = renderInTheme(
      <>
        <SeverityIcon severity="error" />
        <SeverityIcon severity="error" size="small" />
      </>
    );
    const [medium, small] = container.querySelectorAll('svg');

    expect(medium).toHaveStyle({ width: '24px', height: '24px' });
    expect(small).toHaveStyle({ width: '20px', height: '20px' });
  });

  it('becomes an image with a name when given titleAccess', () => {
    renderInTheme(<SeverityIcon severity="critical" titleAccess="Critical" />);

    expect(screen.getByRole('img', { name: 'Critical' })).toBeInTheDocument();
  });
});
