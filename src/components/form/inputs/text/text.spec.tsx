import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { MenuItem, TextFieldProps } from '@mui/material';
import TextInput from './text';
import { TextInputProps } from './text.types';

const StoredValue = () => {
  const value = useWatch({ name: 'host' });
  return <span data-testid="stored-value">{JSON.stringify(value)}</span>;
};

const TouchedState = () => {
  const { touchedFields } = useFormState({ name: 'host' });
  return <span data-testid="touched">{String(!!touchedFields.host)}</span>;
};

const Form = ({
  textFieldProps,
  transform,
  defaultValue = '',
  children,
}: {
  textFieldProps?: TextFieldProps;
  transform?: TextInputProps['transform'];
  defaultValue?: unknown;
  children?: React.ReactNode;
}) => {
  const methods = useForm<{ host: unknown }>({ defaultValues: { host: defaultValue } });

  return (
    <FormProvider {...methods}>
      {children ?? <TextInput name="host" textFieldProps={textFieldProps} transform={transform} />}
      <StoredValue />
      <TouchedState />
    </FormProvider>
  );
};

const input = () => screen.getByTestId('text-input-host');

const type = (value: string) => fireEvent.change(input(), { target: { value } });

const blur = () => fireEvent.blur(input());

const storedValue = () => JSON.parse(screen.getByTestId('stored-value').textContent ?? '');

const isTouched = () => screen.getByTestId('touched').textContent === 'true';

describe('TextInput', () => {
  it('stores the raw text when no onChange is given', () => {
    render(<Form />);

    type('abc');

    expect(storedValue()).toBe('abc');
    expect(input()).toHaveValue('abc');
  });

  describe('textFieldProps.onChange', () => {
    it.each<[string, unknown]>([
      ['a string', 'ABC'],
      ['an empty string', ''],
      ['a number', 42],
      ['null', null],
      ['a promise', Promise.resolve('ABC')],
    ])('stores the typed text when it returns %s', (_, returned) => {
      const onChange = vi.fn(() => returned);
      render(<Form textFieldProps={{ onChange }} />);

      type('abc');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(storedValue()).toBe('abc');
      expect(input()).toHaveValue('abc');
    });

    it('is called after the typed text is stored', () => {
      let storedWhenCalled: unknown;
      const Probe = () => {
        const { getValues } = useFormContext();
        return (
          <TextInput
            name="host"
            textFieldProps={{
              onChange: () => {
                storedWhenCalled = getValues('host');
              },
            }}
          />
        );
      };
      render(
        <Form>
          <Probe />
        </Form>
      );

      type('abc');

      expect(storedWhenCalled).toBe('abc');
    });
  });

  it('stores the text when InputProps.onChange is given, and calls it after the store', () => {
    let storedWhenCalled: unknown;
    const Probe = () => {
      const { getValues } = useFormContext();
      return (
        <TextInput
          name="host"
          textFieldProps={{
            InputProps: { onChange: () => (storedWhenCalled = getValues('host')) },
          }}
        />
      );
    };
    render(
      <Form>
        <Probe />
      </Form>
    );

    type('abc');

    expect(storedValue()).toBe('abc');
    expect(storedWhenCalled).toBe('abc');
  });

  it('stores the text when slotProps.input is a callback with its own onChange', () => {
    const onInputChange = vi.fn();
    render(<Form textFieldProps={{ slotProps: { input: () => ({ onChange: onInputChange }) } }} />);

    type('abc');

    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(storedValue()).toBe('abc');
  });

  it.each<[string, TextFieldProps]>([
    ['InputProps', { InputProps: { onChange: undefined } }],
    ['slotProps.input', { slotProps: { input: { onChange: undefined } } }],
    ['a slotProps.input callback', { slotProps: { input: () => ({ onChange: undefined }) } }],
  ])('stores the text when the onChange of %s is explicitly undefined', (_, textFieldProps) => {
    render(<Form textFieldProps={textFieldProps} />);

    type('abc');

    expect(storedValue()).toBe('abc');
  });

  it('stores the chosen option of a native select with its own SelectProps.onChange', () => {
    const onSelectChange = vi.fn();
    render(
      <Form
        textFieldProps={{
          select: true,
          SelectProps: { native: true, onChange: onSelectChange },
          children: [
            <option key="" value="" />,
            <option key="b" value="b">
              B
            </option>,
          ],
        }}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });

    expect(onSelectChange).toHaveBeenCalledTimes(1);
    expect(storedValue()).toBe('b');
  });

  it('stores the chosen option of a select with its own SelectProps.onChange', () => {
    const onSelectChange = vi.fn();
    render(
      <Form
        textFieldProps={{
          select: true,
          SelectProps: { onChange: onSelectChange },
          children: [
            <MenuItem key="a" value="a">
              A
            </MenuItem>,
            <MenuItem key="b" value="b">
              B
            </MenuItem>,
          ],
        }}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'B' }));

    expect(onSelectChange).toHaveBeenCalledTimes(1);
    expect(storedValue()).toBe('b');
  });

  it('stores the chosen option of a select and calls its InputProps.onChange', () => {
    const onInputChange = vi.fn();
    render(
      <Form
        textFieldProps={{
          select: true,
          InputProps: { onChange: onInputChange },
          children: [
            <MenuItem key="a" value="a">
              A
            </MenuItem>,
            <MenuItem key="b" value="b">
              B
            </MenuItem>,
          ],
        }}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'B' }));

    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(storedValue()).toBe('b');
  });

  it('stores the chosen option of a select whose SelectProps.onChange is explicitly undefined', () => {
    render(
      <Form
        textFieldProps={{
          select: true,
          SelectProps: { onChange: undefined },
          children: [
            <MenuItem key="a" value="a">
              A
            </MenuItem>,
            <MenuItem key="b" value="b">
              B
            </MenuItem>,
          ],
        }}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'B' }));

    expect(storedValue()).toBe('b');
  });

  describe('textFieldProps.onBlur', () => {
    it.each<[string, unknown]>([
      ['the trimmed text', 'abc'],
      ['nothing', undefined],
    ])('keeps the typed text when it returns %s', (_, returned) => {
      const onBlur = vi.fn(() => returned);
      render(<Form textFieldProps={{ onBlur }} />);

      type('  abc  ');
      blur();

      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(storedValue()).toBe('  abc  ');
    });

    it('marks the field as touched', () => {
      render(<Form textFieldProps={{ onBlur: vi.fn() }} />);

      blur();

      expect(isTouched()).toBe(true);
    });
  });

  it('marks the field as touched on blur', () => {
    render(<Form />);

    blur();

    expect(isTouched()).toBe(true);
  });

  const slotsWithBlur: [string, (onBlur?: () => void) => TextFieldProps][] = [
    ['InputProps', (onBlur) => ({ InputProps: { onBlur } })],
    ['slotProps.input', (onBlur) => ({ slotProps: { input: { onBlur } } })],
    ['a slotProps.input callback', (onBlur) => ({ slotProps: { input: () => ({ onBlur }) } })],
  ];

  it.each(slotsWithBlur)('marks the field as touched when %s has its own onBlur', (_, props) => {
    const onBlur = vi.fn();
    render(<Form textFieldProps={props(onBlur)} />);

    blur();

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(isTouched()).toBe(true);
  });

  it.each(slotsWithBlur)(
    'marks the field as touched when the onBlur of %s is explicitly undefined',
    (_, props) => {
      render(<Form textFieldProps={props(undefined)} />);

      blur();

      expect(isTouched()).toBe(true);
    }
  );

  describe('transform', () => {
    it('stores and shows what output returns', () => {
      render(<Form transform={{ output: (text) => text.toUpperCase() }} />);

      type('abc');

      expect(storedValue()).toBe('ABC');
      expect(input()).toHaveValue('ABC');
    });

    it('shows the stored value through input', () => {
      render(
        <Form
          defaultValue={['a', 'b']}
          transform={{
            input: (value) => (value as string[]).join(' '),
            output: (text) => text.split(' '),
          }}
        />
      );

      expect(input()).toHaveValue('a b');

      type('a b c');

      expect(storedValue()).toEqual(['a', 'b', 'c']);
      expect(input()).toHaveValue('a b c');
    });

    it('stores what output returns when InputProps has its own onChange', () => {
      const onInputChange = vi.fn();
      render(
        <Form
          textFieldProps={{ InputProps: { onChange: onInputChange } }}
          transform={{ output: (text) => text.toUpperCase() }}
        />
      );

      type('abc');

      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(storedValue()).toBe('ABC');
    });
  });
});
