import { LabeledContentProps } from '../../../labeled-content';
import { Control, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

import { FormHelperTextProps } from '@mui/material/FormHelperText';
import { TextFieldProps } from '@mui/material/TextField';

export type TextInputProps<T extends FieldValues = FieldValues> = {
  control?: Control<T>;
  controllerProps?: Omit<UseControllerProps<T>, 'name' | 'control'>;
  name: FieldPath<T>;
  label?: string;
  labelProps?: LabeledContentProps;
  textFieldProps?: TextFieldProps;
  isRequired?: boolean;
  formHelperTextProps?: Partial<FormHelperTextProps>;
};
