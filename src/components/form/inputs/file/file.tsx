import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
  UseControllerProps,
} from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import UpgradeIcon from '@mui/icons-material/Upgrade';

type FileInputProps<T extends FieldValues = FieldValues> = {
  name: FieldPath<T>;
  label: string;
  control?: Control<T>;
  controllerProps?: Omit<UseControllerProps<T>, 'name' | 'control'>;
  textFieldProps?: TextFieldProps;
  fileInputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
};

const FileInput = <T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  controllerProps,
  textFieldProps = {},
  fileInputProps = {},
}: FileInputProps<T>) => {
  const formContext = useFormContext<T>();
  const contextControl = formContext?.control;

  return (
    <Controller
      name={name}
      control={control ?? contextControl}
      render={({ field, fieldState: { error } }) => (
        <TextField
          label={label}
          {...field}
          {...textFieldProps}
          value={
            typeof File !== 'undefined' && (field.value as unknown) instanceof File
              ? (field.value as File).name
              : ''
          }
          type="text"
          size="small"
          error={!!error}
          InputProps={{
            endAdornment: (
              <IconButton component="label">
                <UpgradeIcon fontSize="medium" />
                <input
                  style={{ display: 'none' }}
                  type="file"
                  hidden
                  onChange={(event) => {
                    const { files } = event.target;

                    if (files) {
                      const file = files[0];
                      field.onChange(file);
                    }
                  }}
                  {...fileInputProps}
                />
              </IconButton>
            ),
          }}
          helperText={error ? error.message : textFieldProps?.helperText}
        />
      )}
      {...controllerProps}
    />
  );
};

export default FileInput;
