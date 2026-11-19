import { TextField, TextFieldProps } from '@mui/material';
import { kebabize } from '@/utils';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { TextInputProps } from './text.types';

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type InputBlurEvent = React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>;
type SelectSlotProps = NonNullable<TextFieldProps['slotProps']>['select'];
type FieldHandlers = {
  onChange: (event: InputChangeEvent) => void;
  onBlur: (event: InputBlurEvent) => void;
};
type SlotPropsWithHandlers =
  | {
      onChange?: (event: InputChangeEvent, ...rest: unknown[]) => void;
      onBlur?: (event: InputBlurEvent, ...rest: unknown[]) => void;
    }
  | undefined;

// A slot's own onChange or onBlur replaces the TextField's in MUI, so the form's handler is composed into it.
const withFieldHandlers = (slot: unknown, handlers: FieldHandlers) => {
  const compose = (props: SlotPropsWithHandlers) => {
    if (!props) return props;
    const { onChange: slotOnChange, onBlur: slotOnBlur, ...slotProps } = props;

    return {
      ...slotProps,
      ...(slotOnChange && {
        onChange: (event: InputChangeEvent, ...rest: unknown[]) => {
          handlers.onChange(event);
          slotOnChange(event, ...rest);
        },
      }),
      ...(slotOnBlur && {
        onBlur: (event: InputBlurEvent, ...rest: unknown[]) => {
          handlers.onBlur(event);
          slotOnBlur(event, ...rest);
        },
      }),
    };
  };

  return typeof slot === 'function'
    ? (ownerState: unknown) => compose(slot(ownerState))
    : compose(slot as SlotPropsWithHandlers);
};

const TextInput = <T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  controllerProps,
  textFieldProps = {},
  transform,
  isRequired,
  formHelperTextProps = {},
}: TextInputProps<T>) => {
  const formContext = useFormContext<T>();
  const contextControl = formContext?.control;

  const { sx: textFieldPropsSx, onChange, onBlur, slotProps, ...restFieldProps } = textFieldProps;
  const { sx: formHelperTextPropsSx } = formHelperTextProps;

  return (
    <Controller
      name={name}
      control={control ?? contextControl}
      render={({
        field: { onChange: fieldOnChange, onBlur: fieldOnBlur, value, ...field },
        fieldState: { error },
      }) => {
        const handlers: FieldHandlers = {
          onChange: (event) => {
            fieldOnChange(transform?.output ? transform.output(event.target.value) : event);
            onChange?.(event);
          },
          onBlur: (event) => {
            fieldOnBlur();
            onBlur?.(event);
          },
        };

        return (
          <TextField
            label={label}
            {...field}
            value={transform?.input ? transform.input(value) : value}
            size={restFieldProps?.size || 'small'}
            sx={{ mt: 3, ...textFieldPropsSx }}
            {...restFieldProps}
            onChange={handlers.onChange}
            onBlur={handlers.onBlur}
            slotProps={{
              ...slotProps,
              input: withFieldHandlers(slotProps?.input ?? restFieldProps.InputProps, handlers),
              select: withFieldHandlers(
                slotProps?.select ?? restFieldProps.SelectProps,
                handlers
              ) as SelectSlotProps,
            }}
            variant="outlined"
            required={isRequired}
            error={!!error}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              'data-testid': `text-input-${kebabize(name)}`,
              onWheel: (e) => {
                (e.target as HTMLElement).blur();
              },
              ...restFieldProps?.inputProps,
            }}
            helperText={error ? error.message : restFieldProps?.helperText}
            FormHelperTextProps={{
              sx: formHelperTextPropsSx,
            }}
          />
        );
      }}
      {...controllerProps}
    />
  );
};

export default TextInput;
