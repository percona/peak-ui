import { LabeledContentProps } from '../../../labeled-content';
import { Control, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';
import { ToggleButtonGroupProps } from '@mui/material/ToggleButtonGroup';

export type ToggleButtonGroupInputProps<T extends FieldValues = FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  labelProps?: LabeledContentProps;
  control?: Control<T>;
  controllerProps?: Omit<UseControllerProps<T>, 'name' | 'control'>;
  toggleButtonGroupProps?: ToggleButtonGroupProps;
  children: React.ReactNode;
};
