import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import StatusCard from './status-card';

const meta = {
  title: 'Feedback/Status Card',
  component: StatusCard,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'A `StateIndicator` with the one action that changes it, on an outlined card: the facet of a `StatusBanner` that asks for something, such as "No alerts set up" with "Set up alerts".',
          '',
          'The whole card takes the action. It tints on hover like a list row, and a click anywhere on it clicks the action, while the action stays a button of its own, with its own hover and focus, and the only stop for the keyboard and for screen readers.',
          '',
          'Make the action a small text `Button` with an end arrow: `ArrowDownward` when it leads further down the page, `ArrowForward` when it opens another page. `mixedProblems` edges the card in the error color, so the facet that needs attention first stands out.',
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
} satisfies Meta<typeof StatusCard>;

export default meta;
type Story = StoryObj<typeof StatusCard>;

export const NeedsAttention: Story = {
  render: () => (
    <StatusCard
      state="mixedProblems"
      action={
        <Button size="small" href="#" endIcon={<ArrowDownward />}>
          Review 15 issues
        </Button>
      }
    >
      2 of 14 clusters need attention
    </StatusCard>
  ),
};

export const Failing: Story = {
  render: () => (
    <StatusCard
      state="errors"
      action={
        <Button size="small" href="#" endIcon={<ArrowForward />}>
          Open alerts
        </Button>
      }
    >
      32 alerts firing
    </StatusCard>
  ),
};

export const NotSetUp: Story = {
  name: 'Not set up',
  render: () => (
    <StatusCard
      state="notSetUp"
      action={
        <Button size="small" href="#" endIcon={<ArrowForward />}>
          Set up backups
        </Button>
      }
    >
      3 of 14 clusters protected
    </StatusCard>
  ),
};

export const Narrow: Story = {
  render: () => (
    <Box sx={{ width: 200 }}>
      <StatusCard
        state="errors"
        action={
          <Button size="small" href="#" endIcon={<ArrowForward />}>
            Open backups
          </Button>
        }
      >
        1 backup failed, last good 6h ago
      </StatusCard>
    </Box>
  ),
};
