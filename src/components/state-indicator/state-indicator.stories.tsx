import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Box from '@mui/material/Box';
import StateIndicator from './state-indicator';
import type { StateIndicatorState } from './state-indicator.types';

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
          'One fact with its state, such as "All 14 clusters are healthy": an icon and a short label. It is the building block of `StatusCard` and `StatusBanner`, and it is how every Percona app says how something is doing, so readers learn one set of signals.',
          '',
          'The nine states are a closed set, named after the Figma State indicator. Each fixes its icon and its colors from theme tokens, which is the point: an app picks the state that is true, never a color or an icon. When no state fits, ask the design team for a new one instead of styling your own.',
          '',
          '- `healthy`: everything counted is fine.',
          '- `mixedProblems`: something counted is down or failing. The only filled state, so use it at most once per banner, for what needs attention first.',
          '- `degraded`: something works, but not as it should.',
          '- `loading`: the state is being checked; the icon turns unless the reader prefers reduced motion.',
          '- `errors`: things are failing beside the subject itself, such as firing alerts or failed backups.',
          '- `notSetUp`: nothing is configured yet. Show it on a `StatusCard` with the action that sets it up, when the reader can.',
          '- `information`: something is in progress and needs nothing, such as a running backup.',
          '- `silenced`: problems are muted on purpose.',
          '- `default`: a neutral fact.',
          '',
          'An indicator never links anywhere: when a state has an action, such as "Set up alerts", put the indicator and the action on a `StatusCard`.',
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
  render: ({ state, children }) => <StateIndicator state={state}>{children}</StateIndicator>,
} satisfies Meta<typeof StateIndicator>;

export default meta;
type Story = StoryObj<typeof StateIndicator>;

export const Playground: Story = {};

export const States: Story = {
  name: 'All states',
  parameters: { controls: { disable: true } },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2.5 }}>
      {EXAMPLES.map(([state, label]) => (
        <StateIndicator key={state} state={state}>
          {label}
        </StateIndicator>
      ))}
    </Box>
  ),
};
