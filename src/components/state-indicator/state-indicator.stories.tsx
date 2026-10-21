import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Box from '@mui/material/Box';
import StateIndicator from './state-indicator';
import type { StateIndicatorProps, StateIndicatorState } from './state-indicator.types';

const EXAMPLES: Array<[StateIndicatorState, string]> = [
  ['healthy', 'All 14 clusters are healthy'],
  ['mixedProblems', '2 of 14 clusters need attention'],
  ['degraded', '5 of 14 clusters degraded'],
  ['loading', 'Checking clusters...'],
  ['errors', '32 alerts firing'],
  ['notSetUp', 'No alerts set up'],
  ['information', 'Backup running on set-billing-02'],
  ['silenced', 'Alerts silenced until Aug 23, 8:00 am'],
  ['default', 'Backup running on set-billing-02'],
  ['actionable', 'Set up alerts'],
];

const meta = {
  title: 'Feedback/State Indicator',
  component: StateIndicator,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'One fact with its state, such as "All 14 clusters are healthy": an icon and a short label. It is the building block of `StatusBanner`, and it is how every Percona app says how something is doing, so readers learn one set of signals.',
          '',
          'The ten states are a closed set, named after the Figma State indicator. Each fixes its icon and its colors from theme tokens, which is the point: an app picks the state that is true, never a color or an icon. When no state fits, ask the design team for a new one instead of styling your own.',
          '',
          '- `healthy`: everything counted is fine.',
          '- `mixedProblems`: something counted is down or failing. The only filled state, so use it at most once per banner, for what needs attention first.',
          '- `degraded`: something works, but not as it should.',
          '- `loading`: the state is being checked; the icon turns unless the reader prefers reduced motion.',
          '- `errors`: things are failing beside the subject itself, such as firing alerts or failed backups.',
          '- `notSetUp`: nothing is configured yet. Follow it with an `actionable` indicator when the reader can set it up.',
          '- `information`: something is in progress and needs nothing, such as a running backup.',
          '- `silenced`: problems are muted on purpose.',
          '- `default`: a neutral fact.',
          '- `actionable`: a link to what changes the state. Pass `href`, or `component={RouterLink}` with `to`.',
          '',
          'The icon is decorative, so the label must say the state on its own: "2 of 14 clusters need attention", not just "2 of 14".',
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
    state: 'healthy',
    children: 'All 14 clusters are healthy',
  },
  argTypes: {
    state: {
      options: EXAMPLES.map(([state]) => state),
      control: { type: 'select' },
    },
    children: { control: 'text' },
  },
  render: ({ state, children }) =>
    state === 'actionable' ? (
      <StateIndicator state="actionable" href="#">
        {children}
      </StateIndicator>
    ) : (
      <StateIndicator state={state}>{children}</StateIndicator>
    ),
} satisfies Meta<StateIndicatorProps>;

export default meta;
type Story = StoryObj<StateIndicatorProps>;

export const Playground: Story = {};

export const States: Story = {
  name: 'All states',
  parameters: { controls: { disable: true } },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2.5 }}>
      {EXAMPLES.map(([state, label]) =>
        state === 'actionable' ? (
          <StateIndicator key={state} state="actionable" href="#">
            {label}
          </StateIndicator>
        ) : (
          <StateIndicator key={state} state={state}>
            {label}
          </StateIndicator>
        )
      )}
    </Box>
  ),
};
