import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import SearchDialogOption from './search-dialog-option';

const renderOption = (node: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme(getThemeOptions('pmm')('light'))}>
      <div role="listbox" aria-label="Results">
        <div role="option" aria-selected="false">
          {node}
        </div>
      </div>
    </ThemeProvider>
  );

const marks = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('mark')).map((mark) => mark.textContent);

describe('SearchDialogOption', () => {
  it('highlights the label by query', () => {
    const { container } = renderOption(<SearchDialogOption label="Banana analytics" query="ana" />);

    expect(marks(container)).toEqual(['ana']);
  });

  it('highlights the label by explicit ranges over the query', () => {
    const { container } = renderOption(
      <SearchDialogOption label="Query analytics" query="query" labelRanges={[[6, 9]]} />
    );

    expect(marks(container)).toEqual(['ana']);
  });

  it('reads a breadcrumb with commas and hides its separators', () => {
    renderOption(
      <SearchDialogOption label="Data retention" description={['Settings', 'Advanced']} />
    );

    const option = screen.getByRole('option');
    expect(option).toHaveTextContent('Settings, › Advanced');
    expect(screen.getByText('›')).toHaveAttribute('aria-hidden', 'true');
    expect(option).toHaveAccessibleName('Data retention Settings, Advanced');
  });

  it('draws a plain description', () => {
    renderOption(<SearchDialogOption label="Reports" description="Analytics" />);

    expect(screen.getByText('Analytics')).toHaveClass('MuiTypography-helperText');
    expect(screen.getByRole('option')).toHaveAccessibleName('Reports Analytics');
  });

  it('hides the icon and meta slots from assistive technology', () => {
    renderOption(
      <SearchDialogOption
        label="Settings"
        icon={<SettingsOutlined />}
        meta={<span>Opens in a new tab</span>}
      />
    );

    const option = screen.getByRole('option');
    expect(screen.getByText('Opens in a new tab').parentElement).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(
      within(option).getByTestId('SettingsOutlinedIcon').closest('.SearchDialogOption-icon')
    ).toHaveAttribute('aria-hidden', 'true');
    expect(option).toHaveAccessibleName('Settings');
  });

  it('shows the error icon for an error row in place of its icon', () => {
    renderOption(
      <SearchDialogOption label="Couldn't load" icon={<SettingsOutlined />} status="error" />
    );

    const option = screen.getByRole('option');
    expect(within(option).getByTestId('ErrorOutlineOutlinedIcon')).toHaveClass(
      'MuiSvgIcon-colorError'
    );
    expect(within(option).queryByTestId('SettingsOutlinedIcon')).toBeNull();
  });
});
