import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Box from '@mui/material/Box';
import { QueryStatsIcon } from '../icons';
import ShortcutTile from './shortcut-tile';

const meta = {
  title: 'Navigation/Shortcut Tile',
  component: ShortcutTile,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'A link to another place: its 24px icon beside its name in the sidebar’s `menuText` style, centred in a 56px cell that is the whole link, tinted on hover, with a focus ring inside its edge. Use it in `ShortcutTiles`, which rules the cells.',
          '',
          'Give it the icon the sidebar draws for the place, and a `tooltip` with where the place sits, such as "Apps › Operations for MongoDB › Fleet". Pass `component={RouterLink}` with `to`, or `href` for a plain link. A name too long for one line, as in a narrow row, takes a second line in the same height, then ends in an ellipsis.',
        ].join('\n'),
      },
      page: () => (
        <>
          <DocBlock.Title />
          <DocBlock.Subtitle />
          <DocBlock.Description />
          <DocBlock.Primary />
          <DocBlock.Stories />
        </>
      ),
    },
    controls: { disable: true },
  },
} satisfies Meta<typeof ShortcutTile>;

export default meta;
type Story = StoryObj<typeof ShortcutTile>;

export const Default: Story = {
  args: {
    icon: <QueryStatsIcon />,
    label: 'Query analytics',
    tooltip: 'Query analytics',
    href: '#qan',
  },
  render: (args) => (
    <Box sx={{ width: 240 }}>
      <ShortcutTile {...args} />
    </Box>
  ),
};

export const LongName: Story = {
  name: 'A long name in a narrow tile',
  args: {
    icon: <QueryStatsIcon />,
    label: 'Query analytics for every MongoDB cluster and replica set',
    tooltip: 'Query analytics',
    href: '#qan',
  },
  render: (args) => (
    <Box sx={{ width: 160 }}>
      <ShortcutTile {...args} />
    </Box>
  ),
};
