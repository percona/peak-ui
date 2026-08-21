import { Control, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';
import { LabeledContentProps } from '../../..';
import { CheckboxProps as MUICheckboxProps } from '@mui/material/Checkbox';

export type CheckboxProps<T extends FieldValues = FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  control?: Control<T>;
  controllerProps?: Omit<UseControllerProps<T>, 'name' | 'control'>;
  checkboxProps?: MUICheckboxProps;
  labelProps?: LabeledContentProps;
  disabled?: boolean;
};
