import { type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider, type PaletteMode } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getThemeOptions } from '../../design';
import StatusCard from './status-card';

const themeFor = (mode: PaletteMode = 'light') => createTheme(getThemeOptions('pmm')(mode));

const renderInTheme = (node: ReactNode, mode: PaletteMode = 'light') =>
  render(<ThemeProvider theme={themeFor(mode)}>{node}</ThemeProvider>);

const renderCard = (onAction = vi.fn()) => {
  renderInTheme(
    <StatusCard
      state="errors"
      data-testid="alerts"
      action={
        <Button size="small" onClick={onAction}>
          Open alerts
        </Button>
      }
    >
      32 alerts firing
    </StatusCard>
  );

  return onAction;
};

describe('StatusCard', () => {
  afterEach(() => {
    window.getSelection()?.removeAllRanges();
  });

  it('shows the state with its label, and the action under it', () => {
    renderCard();

    expect(screen.getByText('32 alerts firing').closest('[data-state]')).toHaveAttribute(
      'data-state',
      'errors'
    );
    expect(screen.getByRole('button', { name: 'Open alerts' })).toBeInTheDocument();
  });

  it('takes the action on a click anywhere on the card', () => {
    const onAction = renderCard();

    fireEvent.click(screen.getByText('32 alerts firing'));
    fireEvent.click(screen.getByTestId('alerts'));

    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('takes the action once on a click on the action itself', () => {
    const onAction = renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Open alerts' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('leaves a click alone while the reader selects the label', () => {
    const onAction = renderCard();
    const range = document.createRange();

    range.selectNodeContents(screen.getByText('32 alerts firing'));
    window.getSelection()?.addRange(range);
    fireEvent.click(screen.getByText('32 alerts firing'));

    expect(onAction).not.toHaveBeenCalled();
  });

  it('follows a link action, so routers navigate as on a direct click', () => {
    renderInTheme(
      <StatusCard
        state="notSetUp"
        action={
          <Button size="small" href="#needs-attention">
            Review 5 issues
          </Button>
        }
      >
        5 of 14 clusters degraded
      </StatusCard>
    );

    const link = screen.getByRole('link', { name: 'Review 5 issues' });
    const onLinkClick = vi.fn((event: MouseEvent) => event.preventDefault());

    link.addEventListener('click', onLinkClick);
    fireEvent.click(screen.getByText('5 of 14 clusters degraded'));

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the outlined card border in every state', () => {
    renderInTheme(
      <>
        <StatusCard state="mixedProblems" data-testid="health" action={<Button>Review</Button>}>
          2 of 14 clusters need attention
        </StatusCard>
        <StatusCard state="errors" data-testid="alerts" action={<Button>Open alerts</Button>}>
          32 alerts firing
        </StatusCard>
      </>,
      'dark'
    );

    for (const id of ['health', 'alerts']) {
      const card = screen.getByTestId(id);
      expect(card).toHaveClass('MuiPaper-outlined');
      expect(card).toHaveStyle({ borderWidth: '1px', padding: '7px' });
    }
    expect(getComputedStyle(screen.getByTestId('health')).borderColor).toBe(
      getComputedStyle(screen.getByTestId('alerts')).borderColor
    );
  });
});
