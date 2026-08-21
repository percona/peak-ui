import { PaletteMode, ThemeOptions } from '@mui/material/styles';

export type ThemeContextProviderProps = {
  children: React.ReactNode;
  themeOptions: (mode: PaletteMode) => ThemeOptions;
  saveColorModeOnLocalStorage?: boolean;
};
