import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { baseThemeOptions, ThemeContextProvider } from './design';

export const renderWithTheme = (ui: ReactElement): RenderResult =>
  render(<ThemeContextProvider themeOptions={baseThemeOptions}>{ui}</ThemeContextProvider>);
