import { DialogTitleProps } from './dialog-title.types';

import MuiDialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const DialogTitle = ({ onClose, children, ...props }: DialogTitleProps) => (
  <>
    <MuiDialogTitle {...props}>{children}</MuiDialogTitle>
    {onClose ? (
      <IconButton
        aria-label="close"
        data-testid="close-dialog-icon"
        onClick={onClose}
        sx={{
          position: 'absolute',
          p: 2,
          top: 0,
          right: 0,
        }}
      >
        <CloseIcon />
      </IconButton>
    ) : null}
  </>
);

export default DialogTitle;
