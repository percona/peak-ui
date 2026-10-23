import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { ReactNode } from 'react';
import StateIndicator from '../state-indicator';
import StatusCard from '../status-card';
import StatusBanner from './status-banner';

const meta = {
  title: 'Feedback/Status Banner',
  component: StatusBanner,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          "A page's status under its header: one facet per child, such as health, alerts and backups. A facet with nothing to do is a `StateIndicator`; a facet with an action is a `StatusCard`.",
          '',
          "The facets sit centered on one line, with dots between plain ones, and wrap onto centered lines when the banner runs out of room. Narrower than 600px, by its own width rather than the viewport's, they stack one per line, cards full width, and their labels wrap inside.",
          '',
          'Keep it to the few facets a reader checks first, most important first, and always the same facets in the same order on a page, so a change of state is what catches the eye. Give the banner an accessible name with `aria-label`, such as "MongoDB status": it is a list, so screen readers announce how many facets it has.',
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
} satisfies Meta<typeof StatusBanner>;

export default meta;
type Story = StoryObj<typeof StatusBanner>;

const action = (label: string, icon: ReactNode = <ArrowForward />) => (
  <Button size="small" href="#" endIcon={icon}>
    {label}
  </Button>
);

const problematic = (
  <StatusBanner aria-label="MongoDB status">
    <StatusCard state="mixedProblems" action={action('Review 15 issues', <ArrowDownward />)}>
      2 of 14 clusters need attention
    </StatusCard>
    <StatusCard state="errors" action={action('Open alerts')}>
      32 alerts firing
    </StatusCard>
    <StatusCard state="errors" action={action('Open backups')}>
      1 backup failed, last good 6h ago
    </StatusCard>
  </StatusBanner>
);

const incomplete = (
  <StatusBanner aria-label="MongoDB status">
    <StatusCard state="degraded" action={action('Review 5 issues', <ArrowDownward />)}>
      5 of 14 clusters degraded
    </StatusCard>
    <StatusCard state="notSetUp" action={action('Set up alerts')}>
      No alerts set up
    </StatusCard>
    <StatusCard state="notSetUp" action={action('Set up backups')}>
      3 of 14 clusters protected
    </StatusCard>
  </StatusBanner>
);

export const Healthy: Story = {
  render: () => (
    <StatusBanner aria-label="MongoDB status">
      <StateIndicator state="healthy">All 14 clusters are healthy</StateIndicator>
      <StateIndicator state="default">No alerts firing</StateIndicator>
      <StateIndicator state="default">Backups on schedule, last 6h ago</StateIndicator>
    </StatusBanner>
  ),
};

export const Problematic: Story = { render: () => problematic };

export const Incomplete: Story = { render: () => incomplete };

export const Mixed: Story = {
  name: 'Cards and plain facets',
  render: () => (
    <StatusBanner aria-label="MongoDB status">
      <StatusCard state="degraded" action={action('Review 5 issues', <ArrowDownward />)}>
        5 of 14 clusters degraded
      </StatusCard>
      <StateIndicator state="notSetUp">No alerts set up</StateIndicator>
      <StateIndicator state="default">Backups on schedule, last 6h ago</StateIndicator>
    </StatusBanner>
  ),
};

export const Wrapping: Story = {
  render: () => <Box sx={{ width: 640 }}>{problematic}</Box>,
};

export const Narrow: Story = {
  render: () => <Box sx={{ width: 320 }}>{incomplete}</Box>,
};

export const Loading: Story = {
  render: () => (
    <StatusBanner aria-label="MongoDB status">
      <StateIndicator state="loading">Checking clusters...</StateIndicator>
      <StateIndicator state="loading">Checking alerts...</StateIndicator>
      <StateIndicator state="loading">Checking backups...</StateIndicator>
    </StatusBanner>
  ),
};
