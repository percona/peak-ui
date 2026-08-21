import { Fragment } from 'react';
import { StepperProps } from './stepper.types';

import MuiStepper from '@mui/material/Stepper';
import { useTheme } from '@mui/material/styles';

const Stepper = ({ noConnector, connector, dataTestId, sx, ...props }: StepperProps) => {
  const theme = useTheme();

  return (
    <MuiStepper
      data-testid={dataTestId}
      sx={{
        ...(noConnector && {
          '.MuiStep-root': {
            padding: 0,
          },
        }),
        '.MuiStepIcon-root.Mui-active': {
          color: theme.palette.text.primary,
        },
        '.MuiStepIcon-root.Mui-completed': {
          color: theme.palette.primary.light,
        },
        '.MuiStepLabel-label.Mui-active': {
          color: theme.palette.text.primary,
          fontWeight: 600,
        },
        '.MuiStepLabel-label.Mui-completed': {
          color: theme.palette.text.secondary,
          fontWeight: 600,
        },
        '.MuiStepLabel-label': {
          fontWeight: 600,
        },
        ...sx,
      }}
      {...props}
      connector={noConnector ? <Fragment /> : connector}
    />
  );
};

export default Stepper;
