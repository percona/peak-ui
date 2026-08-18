import { ReactNode } from 'react';
import { ButtonProps } from '@mui/material/Button';
import { MenuProps } from '@mui/material/Menu';

export type MenuButtonProps = {
  children?: (handleClose: () => void) => ReactNode;
  buttonText: string;
  buttonProps?: ButtonProps;
  menuProps?: MenuProps;
};
