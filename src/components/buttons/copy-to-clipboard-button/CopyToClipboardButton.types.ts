import { SxProps, Theme } from '@mui/material/styles';
import { ButtonProps } from '@mui/material/Button';

export type CopyToClipboardButtonProps = {
  textToCopy: string;
  iconSx?: SxProps<Theme>;
  buttonProps?: ButtonProps;
  showCopyButtonText?: boolean;
  copyCommand?: string;
};
