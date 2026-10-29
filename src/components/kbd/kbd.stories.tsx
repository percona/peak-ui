import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Kbd from './kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Data display/Keyboard Key',
  component: Kbd,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          "Key caps for a keyboard key or chord, such as the shortcut on `SearchTrigger` or the key hints in `SearchDialog`'s footer. Each entry of `keys` is one cap, in the order the keys are pressed. Every cap in Peak UI is drawn by this component, so its look is set in one place.",
          '',
          'Symbol keys (⌘ ⌥ ⌃ ↑ ↓ ← → ↵ ⏎ ⇥ ⌫) are drawn as icons, so they match the letter keys in size and sit centred on every platform, whatever fonts it has; without a `label`, each is read by its name, such as "Command" or "Up arrow". Word and letter keys use the body font at medium weight.',
          '',
          'Pass `label` with the spoken form, such as "Command K": the caps are hidden from screen readers, which read the label instead. Leave it out when the caps sit inside something already hidden, or already described, and pass `aria-hidden` to hide the whole element.',
          '',
          'Peak UI does no platform detection. The app decides between ⌘ and Ctrl and can describe a shortcut as a `KeyboardShortcut` (`keys`, `text`, `spoken`, `ariaKeyShortcuts`).',
        ].join('\n'),
      },
      page: () => (
        <>
          <DocBlock.Title />
          <DocBlock.Subtitle />
          <DocBlock.Description />
          <DocBlock.Primary />
          <DocBlock.Controls />
          <DocBlock.Stories />
        </>
      ),
    },
  },
  args: {
    keys: ['⌘', 'K'],
    label: 'Command K',
  },
  argTypes: {
    keys: {
      control: 'object',
      description: 'One cap per entry: a single key, or the keys of a chord in order.',
    },
    label: {
      control: 'text',
      description:
        'The spoken form. The caps are hidden from assistive technology and this is read.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Chord: Story = {};

export const Single: Story = {
  args: { keys: 'Esc', label: 'Escape' },
};

export const Symbols: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {['⌘', '⌥', '⌃', '↑', '↓', '←', '→', '↵', '⇥', '⌫', 'Esc', 'Ctrl', 'K'].map((key) => (
        <Kbd key={key} keys={key} />
      ))}
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Every symbol Kbd draws as an icon, next to word and letter keys.',
      },
    },
  },
};

export const InText: Story = {
  render: () => (
    <Typography variant="body2">
      Press <Kbd keys={['Ctrl', 'K']} label="Control K" /> to search, or{' '}
      <Kbd keys="Esc" label="Escape" /> to close.
    </Typography>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Caps are 20px tall and centre on the line of the text around them.',
      },
    },
  },
};
