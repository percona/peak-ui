import { forwardRef, useRef, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { mergeSx } from '@/utils';
import StateIndicator from '../state-indicator';
import type { StatusCardProps } from './status-card.types';

// Controls inside the card handle their own clicks.
const CONTROLS = 'a, button, input, select, textarea, summary, [role="button"], [role="link"]';
// What a click on the card's surface stands for: its action.
const ACTION = 'a[href], button:not(:disabled)';
// Figma's 8px inset draws the card's 1px border inside it, so the padding is 7px.
const INSET = 7;

/** A StateIndicator with the action that changes it, on an outlined card whose whole surface takes the action. */
const StatusCard = forwardRef<HTMLDivElement, StatusCardProps>(
  ({ state, children, action, onClick, sx, ...rest }, ref) => {
    const actions = useRef<HTMLDivElement>(null);

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);

      if (
        event.defaultPrevented ||
        (event.target as Element).closest(CONTROLS) ||
        // Dragging across the label selects it to read or copy, not to act.
        window.getSelection()?.toString()
      ) {
        return;
      }

      actions.current?.querySelector<HTMLElement>(ACTION)?.click();
    };

    return (
      <Card
        ref={ref}
        variant="outlined"
        data-state={state}
        onClick={handleClick}
        sx={mergeSx(
          (theme) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0.5,
            p: `${INSET}px`,
            cursor: 'pointer',
            // A tint over the card's own surface, like a hovered list row.
            '@media (hover: hover)': {
              '&:hover': {
                backgroundImage: `linear-gradient(${theme.palette.primary.hover}, ${theme.palette.primary.hover})`,
              },
            },
          }),
          sx
        )}
        {...rest}
      >
        <StateIndicator state={state}>{children}</StateIndicator>
        <Box ref={actions} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          {action}
        </Box>
      </Card>
    );
  }
);

StatusCard.displayName = 'StatusCard';

export default StatusCard;
