import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Box from '@mui/material/Box';
import ThemedModePanel from '../../../storybook/themed-mode-panel';
import { makeSeries, timeFormatter } from '../charts.utils';
import StatTile from './stat-tile';

const opsFormatter = (value: number) => `${(value / 1000).toFixed(2)}K ops/s`;
const operations = makeSeries({ seed: 11, base: 1800, spread: 400 });

const signals = [
  {
    label: 'Operations',
    value: '1.84K ops/s',
    data: operations,
    valueFormatter: opsFormatter,
  },
  {
    label: 'Latency',
    value: '4.2 ms',
    data: makeSeries({ seed: 5, base: 4, spread: 1.5 }),
    valueFormatter: (value: number) => `${value.toFixed(1)} ms`,
  },
  {
    label: 'Errors',
    value: '0.3/s',
    data: makeSeries({ seed: 2, base: 0.4, spread: 0.3 }),
    valueFormatter: (value: number) => `${value.toFixed(2)}/s`,
  },
  {
    label: 'Connections',
    value: '312',
    data: makeSeries({ seed: 9, base: 300, spread: 30 }),
    valueFormatter: (value: number) => value.toFixed(0),
  },
];

const meta: Meta<typeof StatTile> = {
  title: 'Data display/Charts/Stat Tile',
  component: StatTile,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'A golden-signal tile: what is measured, its current value and a trend of it, such as a cluster’s operations, latency, errors or connections on a Fleet page. Pass the value already formatted with its unit; the tile draws `sparkline` as an area chart unless it says otherwise.',
          '',
          'The tile is a group named by its `label`, and the value is plain text. While `loading`, it shows placeholders and reports itself busy; a sparkline with no points shows `emptyText` instead of an empty chart.',
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
    label: 'Operations',
    value: '1.84K ops/s',
    loading: false,
    sparkline: {
      data: operations,
      valueFormatter: opsFormatter,
      timeFormatter,
      ariaLabel: 'Operations over the last 30 minutes',
    },
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    sparkline: { control: false },
    emptyText: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 360 }}>
        <Story />
      </Box>
    ),
  ],
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 2,
};

export const GoldenSignals: Story = {
  name: 'Golden signals',
  parameters: { controls: { disable: true } },
  render: () => (
    <Box sx={grid}>
      {signals.map(({ label, value, data, valueFormatter }) => (
        <StatTile
          key={label}
          label={label}
          value={value}
          sparkline={{
            data,
            valueFormatter,
            timeFormatter,
            ariaLabel: `${label} over the last 30 minutes`,
          }}
        />
      ))}
    </Box>
  ),
};

export const States: Story = {
  name: 'Loading and no data',
  parameters: { controls: { disable: true } },
  render: () => (
    <Box sx={grid}>
      <StatTile label="Operations" value="1.84K ops/s" sparkline={{ data: operations }} loading />
      <StatTile label="Replication lag" value="—" sparkline={{ data: [] }} />
      <StatTile label="Uptime" value="41 d" />
    </Box>
  ),
};

export const ColorModes: Story = {
  name: 'Light and dark mode',
  parameters: { controls: { disable: true } },
  render: (_args, { globals }) => (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      {(['light', 'dark'] as const).map((mode) => (
        <ThemedModePanel key={mode} mode={mode} themeName={globals.theme ?? 'base'}>
          <StatTile
            label={`Operations (${mode})`}
            value="1.84K ops/s"
            sparkline={{
              data: operations,
              valueFormatter: opsFormatter,
              timeFormatter,
              ariaLabel: `Operations over the last 30 minutes, ${mode} mode`,
            }}
          />
        </ThemedModePanel>
      ))}
    </Box>
  ),
};
