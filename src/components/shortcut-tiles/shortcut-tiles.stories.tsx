import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import TrackChanges from '@mui/icons-material/TrackChanges';
import Box from '@mui/material/Box';
import { PerconaMoIcon, QueryStatsIcon } from '../icons';
import ShortcutTile from '../shortcut-tile';
import ShortcutTiles from './shortcut-tiles';

const meta = {
  title: 'Navigation/Shortcut Tiles',
  component: ShortcutTiles,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'A grid of `ShortcutTile` links to the places a page leads to most, such as a technology hub’s clusters, dashboards and query tools. Every cell is ruled, and the grid is boxed on three sides: the top is left to the line above, such as a page header’s divider, so it reads as part of the header.',
          '',
          'The tiles share the grid in equal widths, whatever their number. It follows its own width rather than the viewport’s: two a line, three from 640px, and every tile on one line once each cell gets 206px, so five go on one line at 1030px and six at 1236px. A last line with fewer tiles keeps its empty cells inside the box.',
          '',
          'Tiles only navigate. Keep counts, states and badges out of them, so they look the same whatever the page says, and put a page’s status in a `StatusBanner`.',
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
} satisfies Meta<typeof ShortcutTiles>;

export default meta;
type Story = StoryObj<typeof ShortcutTiles>;

const tiles = [
  <ShortcutTile
    key="clusters"
    icon={<PerconaMoIcon />}
    label="Clusters"
    tooltip="MongoDB › Clusters"
    href="#clusters"
  />,
  <ShortcutTile
    key="overview"
    icon={<DashboardOutlined />}
    label="Instances overview"
    tooltip="All dashboards › MongoDB › MongoDB Instances Overview"
    href="#overview"
  />,
  <ShortcutTile
    key="qan"
    icon={<QueryStatsIcon />}
    label="Query analytics"
    tooltip="Query analytics"
    href="#qan"
  />,
  <ShortcutTile
    key="realtime"
    icon={<TrackChanges />}
    label="Real-time queries"
    tooltip="Real-time queries"
    href="#realtime"
  />,
];

const UnderHeader = ({ width }: { width?: number }) => (
  <Box sx={{ width, borderTop: 1, borderColor: 'divider' }}>
    <ShortcutTiles>{tiles}</ShortcutTiles>
  </Box>
);

export const Default: Story = {
  name: 'Under a page header',
  render: () => <UnderHeader />,
};

export const Narrow: Story = {
  name: 'Two a line below 640px',
  render: () => <UnderHeader width={360} />,
};

export const Medium: Story = {
  name: 'Three a line until every tile fits',
  render: () => <UnderHeader width={720} />,
};
