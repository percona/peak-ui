import { PickerValidDate } from '@mui/x-date-pickers/models';

export const toValidPickerDate = (value: Date): PickerValidDate | null =>
  Number.isNaN(value.getTime()) ? null : (value as PickerValidDate);
