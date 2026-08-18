import { Control, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';
import { LabeledContentProps } from '../../../labeled-content';

import { RadioGroupProps as MuiRadioGroupProps } from '@mui/material/RadioGroup';
import { RadioProps } from '@mui/material/Radio';

export type RadioGroupOptions = {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  disabled?: boolean;
  radioProps?: RadioProps;
};

export type RadioGroupProps<T extends FieldValues = FieldValues> = {
  control?: Control<T>;
  controllerProps?: Omit<UseControllerProps<T>, 'name' | 'control'>;
  name: FieldPath<T>;
  label?: string;
  labelProps?: LabeledContentProps;
  radioGroupFieldProps?: MuiRadioGroupProps;
  children?: React.ReactNode;
  isRequired?: boolean;
  options: RadioGroupOptions[];
};
