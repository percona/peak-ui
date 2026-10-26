import { forwardRef, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { type Theme, useTheme } from '@mui/material/styles';
import type { PageHeaderProps } from './page-header.types';

const PART = 'data-page-header-part';

// What an element takes on one line: a hidden copy laid out at its max-content width, so the measure never depends on the current layout.
const oneLineWidth = (host: HTMLElement, element: Element | null) => {
  if (!element) {
    return 0;
  }
  const copy = element.cloneNode(true) as HTMLElement;

  Object.assign(copy.style, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    width: 'max-content',
    flexWrap: 'nowrap',
  });
  host.appendChild(copy);
  const { width } = copy.getBoundingClientRect();
  copy.remove();

  return width;
};

/** Whether the title, an inline toolbar on one line and the actions fit side by side; it rechecks as the header resizes or the toolbar's content changes. */
const useToolbarFitsBesideTitle = (
  grid: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  gap: number
) => {
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    const host = grid.current;

    if (!enabled || !host || typeof ResizeObserver === 'undefined') {
      return;
    }
    const part = (name: string) => host.querySelector(`:scope > [${PART}="${name}"]`);
    const measure = () => {
      // Not laid out, as in a hidden tab's first render: keep the last answer.
      if (!host.clientWidth) {
        return;
      }
      const parts = ['title', 'toolbar', 'actions'].map(part).filter(Boolean);
      const needed =
        parts.reduce((sum, element) => sum + oneLineWidth(host, element), 0) +
        gap * (parts.length - 1);

      setFits(needed <= host.clientWidth);
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(host);
    const content = new MutationObserver(measure);
    const toolbar = part('toolbar');
    if (toolbar) {
      content.observe(toolbar, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      resize.disconnect();
      content.disconnect();
    };
  }, [grid, enabled, gap]);

  return fits;
};

const titleType = (theme: Theme, variant: TypographyProps['variant']) =>
  variant && variant !== 'inherit' ? theme.typography[variant] : undefined;

// A zero-width space in the title's type, the strut MUI Select uses, makes a row one title line tall.
const titleLineStrut = (theme: Theme, variant: TypographyProps['variant']) => ({
  ...titleType(theme, variant),
  content: '"\\200B"',
});

// The header's own width picks the layout, not the viewport's: beside a docked sidebar a md viewport leaves it far narrower than md.
const wide = (theme: Theme) => theme.containerQueries.up('md');

/** The top of a page: its h1 title with an optional mark and badge, a description, actions and a toolbar row. */
const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      titleComponent = 'h1',
      titleVariant = 'h4',
      icon,
      badge,
      description,
      actions,
      toolbar,
      toolbarPlacement = 'below',
      divider = false,
      sx,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const gridRef = useRef<HTMLDivElement>(null);
    const inline = toolbarPlacement === 'inline' && !!toolbar;
    // An inline toolbar moves below the title, as one block, once its items no longer fit beside it on one line; only then may they wrap.
    const fitsBesideTitle = useToolbarFitsBesideTitle(
      gridRef,
      inline,
      parseFloat(theme.spacing(3))
    );
    const inlineRow = inline && fitsBesideTitle;
    const wideColumns = [
      inline ? 'auto' : 'minmax(0, 1fr)',
      inline && 'minmax(0, 1fr)',
      actions && (inline ? 'auto' : 'fit-content(50%)'),
    ].filter(Boolean);
    const fullRow = (area: string) => `"${wideColumns.map(() => area).join(' ')}"`;
    // Reading order follows the row: an inline toolbar comes before the actions.
    const narrowAreas = [
      '"title"',
      description && '"description"',
      inline && '"toolbar"',
      actions && '"actions"',
      !inline && toolbar && '"toolbar"',
    ];
    const twoRows = inline && !!actions;
    const mediumAreas = [
      '"title actions"',
      description && '"description description"',
      '"toolbar toolbar"',
    ];
    const wideAreas = [
      `"${['title', inline && 'toolbar', actions && 'actions'].filter(Boolean).join(' ')}"`,
      description && fullRow('description'),
      !inline && toolbar && fullRow('toolbar'),
    ];
    const toolbarRow = toolbar && (
      <Box
        {...{ [PART]: 'toolbar' }}
        sx={{
          gridArea: 'toolbar',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          // Wrapped onto its own line, a toolbar item sits close under the one before it.
          columnGap: inline ? 3 : 1,
          rowGap: 0.5,
          minWidth: 0,
          mt: inline ? 0 : 1,
        }}
      >
        {toolbar}
      </Box>
    );

    // Icon and badge centre on the title's first line, so a wrapping title keeps them beside it.
    const besideTitle = (theme: Theme) => ({
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      '&::before': titleLineStrut(theme, titleVariant),
    });

    return (
      <Box
        ref={ref}
        sx={[
          { containerType: 'inline-size' },
          divider &&
            ((theme: Theme) => ({ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` })),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        <Box
          ref={gridRef}
          sx={(theme) => ({
            display: 'grid',
            // An inline toolbar that does not fit beside the title takes its own row, and the actions keep their place beside the title.
            gridTemplateColumns: twoRows ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
            gridTemplateAreas: (twoRows ? mediumAreas : narrowAreas).filter(Boolean).join(' '),
            // Beside the actions on a narrow header the title gets the room a 24px gap would take.
            columnGap: inline && !twoRows ? 3 : 2,
            rowGap: 2,
            // An inline toolbar sits beside the title whenever it fits there on one line, at any width; otherwise the two-row layout holds.
            ...(inlineRow && {
              gridTemplateColumns: wideColumns.join(' '),
              gridTemplateAreas: wideAreas.filter(Boolean).join(' '),
              columnGap: 3,
              alignItems: 'center',
            }),
            ...(!inline && {
              [wide(theme)]: {
                gridTemplateColumns: wideColumns.join(' '),
                gridTemplateAreas: wideAreas.filter(Boolean).join(' '),
              },
            }),
          })}
        >
          <Box
            {...{ [PART]: 'title' }}
            sx={{
              gridArea: 'title',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              minWidth: 0,
            }}
          >
            {icon && (
              <Box component="span" aria-hidden="true" sx={besideTitle}>
                {icon}
              </Box>
            )}
            <Typography
              variant={titleVariant}
              component={titleComponent}
              sx={{ minWidth: 0, overflowWrap: 'break-word' }}
            >
              {title}
            </Typography>
            {badge && (
              <Box sx={besideTitle}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  {badge}
                </Box>
              </Box>
            )}
          </Box>
          {description && (
            <Typography
              component="div"
              variant="body1"
              color="text.secondary"
              sx={{ gridArea: 'description', minWidth: 0 }}
            >
              {description}
            </Typography>
          )}
          {inline && toolbarRow}
          {actions && (
            <Box
              {...{ [PART]: 'actions' }}
              sx={(theme) => ({
                gridArea: 'actions',
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'start',
                // Beside the title, a box one title line tall centres the actions on its first line; taller buttons stand out of it evenly.
                ...(twoRows && { ...titleType(theme, titleVariant), height: '1lh' }),
                // Inline, the row centres everything, so the actions need no title-line strut.
                ...(inlineRow && { alignSelf: 'center', height: 'auto' }),
                ...(!inline && {
                  [wide(theme)]: { '&::before': titleLineStrut(theme, titleVariant) },
                }),
              })}
            >
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: twoRows ? 'flex-end' : 'flex-start',
                  gap: 1,
                  [wide(theme)]: { justifyContent: 'flex-end' },
                })}
              >
                {actions}
              </Box>
            </Box>
          )}
          {!inline && toolbarRow}
        </Box>
      </Box>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export default PageHeader;
