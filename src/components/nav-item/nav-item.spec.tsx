import { describe, expect, it } from 'vitest';
import { createTheme } from '@mui/material/styles';
import NavItem from '.';
import { baseThemeOptions } from '../../design';
import { renderWithTheme } from '../../test-utils';

// AGENTS.md NavItem constraint: icon-less rows keep a mr:-1.75 spacer so text start-lines align. Fix the component, not this spec.
const spacerMargin = createTheme(baseThemeOptions('light')).spacing(-1.75);

const leadingSlot = (container: HTMLElement) =>
  container.querySelector('.MuiListItemButton-root')?.firstElementChild;

describe('NavItem icon alignment contract', () => {
  it('renders the alignment spacer when no icon is given', () => {
    const { container } = renderWithTheme(<NavItem text="Databases" />);
    expect(container.querySelector('.MuiListItemIcon-root')).toBeNull();
    const spacer = leadingSlot(container);
    expect(
      spacer?.classList.contains('MuiBox-root'),
      'the leading slot must be the alignment spacer Box'
    ).toBe(true);
    expect(spacer).toHaveStyle({ marginRight: spacerMargin });
  });

  it('renders the icon in the leading slot instead of the spacer', () => {
    const { container } = renderWithTheme(
      <NavItem text="Databases" icon={<svg data-testid="icon" />} />
    );
    const slot = leadingSlot(container);
    expect(slot?.classList.contains('MuiListItemIcon-root'), 'icon replaces the spacer').toBe(true);
    expect(slot?.classList.contains('MuiBox-root')).toBe(false);
  });
});
