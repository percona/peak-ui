import { forwardRef, useId, type KeyboardEvent, type Ref } from 'react';
import Box from '@mui/material/Box';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { listItemTextClasses } from '@mui/material/ListItemText';
import type { Theme } from '@mui/material/styles';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { mergeSx } from '@/utils';
import Kbd from '../kbd';
import NavItem from '../nav-item';
import type { NavItemProps } from '../nav-item';
import Tooltip from '../tooltip';
import type { SearchTriggerProps } from './search-trigger.types';

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
const NO_MOTION = { transitionDuration: '0s', transitionDelay: '0s' };

const isTypeAhead = (event: KeyboardEvent) => {
  const key = event.key ?? '';

  return (
    key.length === 1 &&
    key !== ' ' &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.nativeEvent.isComposing &&
    event.keyCode !== 229
  );
};

const SearchTrigger = forwardRef<HTMLButtonElement, SearchTriggerProps>(
  (
    {
      label = 'Search',
      shortcut,
      shortcutDescription,
      collapsed = false,
      icon = <SearchOutlined />,
      morphTransition,
      tooltipPlacement = 'right',
      onTypeAhead,
      onKeyDown,
      title,
      'aria-describedby': ariaDescribedBy,
      sx,
      ...rest
    },
    ref
  ) => {
    const descriptionId = useId();
    const description =
      shortcutDescription ?? (shortcut ? `Shortcut: ${shortcut.spoken}` : undefined);
    const describedBy =
      [ariaDescribedBy, description ? descriptionId : undefined].filter(Boolean).join(' ') ||
      undefined;
    const tooltipTitle = collapsed ? (shortcut ? `${label} (${shortcut.text})` : label) : '';

    const morph = (theme: Theme) => ({
      duration: morphTransition?.duration ?? theme.transitions.duration.shorter,
      easing: morphTransition?.easing ?? theme.transitions.easing.easeInOut,
    });

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);

      if (onTypeAhead && !event.defaultPrevented && isTypeAhead(event)) {
        event.preventDefault();
        onTypeAhead(event.key);
      }
    };

    const trailing = (shortcut || description) && (
      <>
        {shortcut && (
          <Kbd
            keys={shortcut.keys}
            aria-hidden
            sx={(theme) => ({
              opacity: collapsed ? 0 : 1,
              visibility: collapsed ? 'hidden' : 'visible',
              // The caps fade in once the row has mostly widened, and leave at once on collapsing.
              transition: theme.transitions.create(['opacity', 'visibility'], {
                duration: theme.transitions.duration.shorter,
                delay: collapsed ? 0 : morph(theme).duration / 2,
              }),
              [REDUCED_MOTION]: NO_MOTION,
              '@media (hover: none) and (pointer: coarse)': { display: 'none' },
            })}
          />
        )}
        {description && (
          <Box component="span" id={descriptionId} aria-hidden="true" sx={visuallyHidden}>
            {description}
          </Box>
        )}
      </>
    );

    return (
      <Tooltip
        title={tooltipTitle}
        placement={tooltipPlacement}
        enterDelay={500}
        arrow
        describeChild
      >
        <NavItem
          // NavItem types its ref and handlers for its default div root; this one renders a button.
          ref={ref as unknown as Ref<HTMLDivElement>}
          component="button"
          text={label}
          icon={icon}
          badge={trailing || undefined}
          aria-haspopup="dialog"
          aria-keyshortcuts={shortcut?.ariaKeyShortcuts}
          // Explicit, so the tooltip adds neither a native title nor a description of its own.
          title={title}
          aria-describedby={describedBy}
          sx={mergeSx(
            (theme) => ({
              width: '100%',
              textAlign: 'left',
              overflow: 'hidden',
              transition: theme.transitions.create(['padding', 'border-radius'], morph(theme)),
              // The icon-only rail row: 12px either side centres the 24px icon in 48px.
              ...(collapsed && { px: 1.5, borderRadius: 0 }),

              // The label stays in the DOM to name the button, and keeps its line while it fades.
              [`.${listItemTextClasses.root}`]: {
                flexShrink: 0,
                opacity: collapsed ? 0 : 1,
                transition: theme.transitions.create('opacity', morph(theme)),
              },

              // The theme marks focus with a tint alone, which forced colors remove.
              [`&.${buttonBaseClasses.focusVisible}`]: {
                '@media (forced-colors: active)': {
                  outline: '2px solid Highlight',
                  outlineOffset: -2,
                },
              },
              [REDUCED_MOTION]: { ...NO_MOTION, [`.${listItemTextClasses.root}`]: NO_MOTION },
            }),
            sx
          )}
          {...({ ...rest, onKeyDown: handleKeyDown } as unknown as Omit<NavItemProps, 'text'>)}
        />
      </Tooltip>
    );
  }
);

SearchTrigger.displayName = 'SearchTrigger';

export default SearchTrigger;
