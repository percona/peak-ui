import { Control, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

import { FormControlLabelProps as MuiFormControlLabelProps } from '@mui/material/FormControlLabel';
import { SwitchProps } from '@mui/material/Switch';

type FormControlLabelProps = MuiFormControlLabelProps;

export type SwitchInputProps<T extends FieldValues = FieldValues> = {
  control?: Control<T>;
  controllerProps?: Omit<UseControllerProps<T>, 'name' | 'control'>;
  formControlLabelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
  name: FieldPath<T>;
  label: string;
  labelCaption?: string;
  switchFieldProps?: SwitchProps;
};
