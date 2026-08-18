import { DialogTitleProps as MuiDialogTitleProps } from '@mui/material/DialogTitle';

export type DialogTitleProps = {
  onClose?: () => void;
} & MuiDialogTitleProps;
