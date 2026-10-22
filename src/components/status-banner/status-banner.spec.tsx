import { type ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { describe, expect, it } from 'vitest';
import { getThemeOptions } from '../../design';
import StateIndicator from '../state-indicator';
import StatusCard from '../status-card';
import StatusBanner from './status-banner';

const renderInTheme = (node: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme(getThemeOptions('pmm')('light'))}>{node}</ThemeProvider>
  );

const dotsIn = (container: HTMLElement) => [...container.querySelectorAll('[data-dot]')];

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

    expect(items.map((item) => item.textContent?.replace('•', ''))).toEqual([
      'All 14 clusters are healthy',
      'No alerts firing',
      'Backups on schedule, last 6h ago',
    ]);
  });

  it('centers the facets and parts plain ones with dots, hidden from assistive technology', () => {
    const { container } = renderInTheme(
      <StatusBanner>
        <StateIndicator state="healthy">All 14 clusters are healthy</StateIndicator>
        <StateIndicator state="default">No alerts firing</StateIndicator>
        <StateIndicator state="default">Backups on schedule, last 6h ago</StateIndicator>
      </StatusBanner>
    );

    const dots = dotsIn(container);

    expect(screen.getByRole('list')).toHaveStyle({ justifyContent: 'center', flexWrap: 'wrap' });
    expect(dots).toHaveLength(2);
    dots.forEach((dot) => {
      expect(dot).toHaveTextContent('•');
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
    expect(screen.getAllByRole('listitem')[0].querySelector('[data-dot]')).toBeNull();
  });

  it('drops the dots when facets are on cards, and insets plain facets to line up with them', () => {
    const { container } = renderInTheme(
      <StatusBanner>
        <StatusCard state="degraded" action={<Button size="small">Review 5 issues</Button>}>
          5 of 14 clusters degraded
        </StatusCard>
        <StateIndicator state="notSetUp">No alerts set up</StateIndicator>
        <StateIndicator state="default">Backups on schedule, last 6h ago</StateIndicator>
      </StatusBanner>
    );

    const [card, alerts, backups] = screen.getAllByRole('listitem');

    expect(dotsIn(container)).toHaveLength(0);
    expect(within(card).getByRole('button', { name: 'Review 5 issues' })).toBeInTheDocument();
    expect(card).not.toHaveStyle({ padding: '8px' });
    expect(alerts).toHaveStyle({ padding: '8px' });
    expect(backups).toHaveStyle({ padding: '8px' });
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
