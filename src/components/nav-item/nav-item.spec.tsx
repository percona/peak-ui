import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import NavItem from '.';
import { baseThemeOptions, ThemeContextProvider } from '../../design';

const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeContextProvider themeOptions={baseThemeOptions}>{ui}</ThemeContextProvider>);

// Executable contract for the NavItem entry in AGENTS.md "Design Constraints":
// icon-less rows render a negative-margin spacer so text start-lines align
// with icon-bearing rows. Fix regressions in the component, not here.
describe('NavItem icon alignment contract', () => {
  it('renders the alignment spacer when no icon is given', () => {
    const { container } = renderWithTheme(<NavItem text="Databases" />);
    expect(container.querySelector('.MuiListItemIcon-root')).toBeNull();
    const spacer = container.querySelector('.MuiBox-root');
    expect(spacer, 'the icon-less spacer Box preserves text start-line alignment').not.toBeNull();
    expect(spacer).toHaveStyle({ marginRight: '-14px' });
  });

  it('renders the icon slot without the spacer when an icon is given', () => {
    const { container } = renderWithTheme(
      <NavItem text="Databases" icon={<svg data-testid="icon" />} />
    );
    expect(container.querySelector('.MuiListItemIcon-root')).not.toBeNull();
    expect(container.querySelector('.MuiBox-root')).toBeNull();
  });
});
