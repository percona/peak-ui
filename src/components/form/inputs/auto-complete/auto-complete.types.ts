import { Control, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';
import { LabeledContentProps } from '../../../labeled-content';

import { AutocompleteProps } from '@mui/material/Autocomplete';
import { TextFieldProps } from '@mui/material/TextField';

export type AutoCompleteInputProps<TOption, TFieldValues extends FieldValues = FieldValues> = {
  name: FieldPath<TFieldValues>;
  options: TOption[];
  control?: Control<TFieldValues>;
  controllerProps?: Omit<UseControllerProps<TFieldValues>, 'name' | 'control'>;
  label?: string;
  labelProps?: LabeledContentProps;
  autoCompleteProps?: Omit<
    AutocompleteProps<TOption, boolean | undefined, boolean | undefined, boolean | undefined>,
    'options' | 'renderInput'
  >;
  textFieldProps?: TextFieldProps;
  loading?: boolean;
  isRequired?: boolean;
  disabled?: boolean;
  tooltipText?: string;
  onChange?: () => void;
};
