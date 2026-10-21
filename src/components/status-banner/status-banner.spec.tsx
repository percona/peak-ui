import { type ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import StateIndicator from '../state-indicator';
import StatusBanner from './status-banner';

const renderInTheme = (node: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme(getThemeOptions('pmm')('light'))}>{node}</ThemeProvider>
  );

describe('StatusBanner', () => {
  it('lists one item per facet, in order, under its accessible name', () => {
    renderInTheme(
      <StatusBanner aria-label="MongoDB status">
        <StateIndicator state="healthy">All 14 clusters are healthy</StateIndicator>
        <StateIndicator state="default">No alerts firing</StateIndicator>
        <StateIndicator state="default">Backups on schedule, last 6h ago</StateIndicator>
      </StatusBanner>
    );

    const items = within(screen.getByRole('list', { name: 'MongoDB status' })).getAllByRole(
      'listitem'
    );

    expect(items.map((item) => item.textContent?.replace('—', ''))).toEqual([
      'All 14 clusters are healthy',
      'No alerts firing',
      'Backups on schedule, last 6h ago',
    ]);
  });

  it('keeps an indicator and its action in one facet when wrapped in a fragment', () => {
    renderInTheme(
      <StatusBanner>
        <StateIndicator state="degraded">5 of 14 clusters degraded</StateIndicator>
        <>
          <StateIndicator state="notSetUp">No alerts set up</StateIndicator>
          <StateIndicator state="actionable" href="/alerting">
            Set up alerts
          </StateIndicator>
        </>
      </StatusBanner>
    );

    const [, alerts] = screen.getAllByRole('listitem');

    expect(alerts).toHaveTextContent('No alerts set up');
    expect(within(alerts).getByRole('link', { name: 'Set up alerts' })).toBeInTheDocument();
  });

  it('puts a dash between facets only, hidden from assistive technology', () => {
    const { container } = renderInTheme(
      <StatusBanner>
        <StateIndicator state="mixedProblems">2 of 14 clusters need attention</StateIndicator>
        <StateIndicator state="errors">32 alerts firing</StateIndicator>
        <StateIndicator state="errors">1 backup failed, last good 6h ago</StateIndicator>
      </StatusBanner>
    );

    const dashes = [...container.querySelectorAll('li > span[aria-hidden="true"]')];

    expect(dashes).toHaveLength(2);
    dashes.forEach((dash) => expect(dash).toHaveTextContent('—'));
    expect(
      screen.getAllByRole('listitem')[0].querySelector(':scope > span[aria-hidden]')
    ).toBeNull();
  });

  it('leaves out empty facets', () => {
    const alertsOff = false;

    renderInTheme(
      <StatusBanner>
        <StateIndicator state="healthy">All 14 clusters are healthy</StateIndicator>
        {alertsOff && <StateIndicator state="default">No alerts firing</StateIndicator>}
        {null}
        <StateIndicator state="default">Backups on schedule, last 6h ago</StateIndicator>
      </StatusBanner>
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
