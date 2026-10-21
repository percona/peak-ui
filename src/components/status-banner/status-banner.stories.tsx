import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import StateIndicator from '../state-indicator';
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
          "A page's status in one line, under its header: one `StateIndicator` per facet, such as health, alerts and backups, with dashes between them. It wraps when the page is narrow.",
          '',
          'Keep it to the few facets a reader checks first, most important first, and always the same facets in the same order on a page, so a change of state is what catches the eye. Each child is one facet; wrap an indicator and its `actionable` link in a fragment to keep them together.',
          '',
          'Give the banner an accessible name with `aria-label`, such as "MongoDB status". It is a list, so screen readers announce how many facets it has.',
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

export const Healthy: Story = {
  render: () => (
    <StatusBanner aria-label="MongoDB status">
      <StateIndicator state="healthy">All 14 clusters are healthy</StateIndicator>
      <StateIndicator state="default">No alerts firing</StateIndicator>
      <StateIndicator state="default">Backups on schedule, last 6h ago</StateIndicator>
    </StatusBanner>
  ),
};

export const Problematic: Story = {
  render: () => (
    <StatusBanner aria-label="MongoDB status">
      <StateIndicator state="mixedProblems">2 of 14 clusters need attention</StateIndicator>
      <StateIndicator state="errors">32 alerts firing</StateIndicator>
      <StateIndicator state="errors">1 backup failed, last good 6h ago</StateIndicator>
    </StatusBanner>
  ),
};

export const Incomplete: Story = {
  render: () => (
    <StatusBanner aria-label="MongoDB status">
      <StateIndicator state="degraded">5 of 14 clusters degraded</StateIndicator>
      <>
        <StateIndicator state="notSetUp">No alerts set up</StateIndicator>
        <StateIndicator state="actionable" href="#">
          Set up alerts
        </StateIndicator>
      </>
      <>
        <StateIndicator state="notSetUp">3 of 5 clusters protected</StateIndicator>
        <StateIndicator state="actionable" href="#">
          Set up backups
        </StateIndicator>
      </>
    </StatusBanner>
  ),
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
