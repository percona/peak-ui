import { DialogProps } from './dialog.types';

import LinearProgress from '@mui/material/LinearProgress';
import MatDialog from '@mui/material/Dialog';

const Dialog = ({ loading, children, ...props }: DialogProps) => {
  return (
    <MatDialog {...props}>
      {loading && <LinearProgress></LinearProgress>}
      {children}
    </MatDialog>
  );
};

export default Dialog;
