import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import type { PageHeaderProps } from './page-header.types';

// A zero-width space in the title's type, the strut MUI Select uses, makes a row one title line tall.
const titleLineStrut = (theme: Theme, variant: TypographyProps['variant']) => ({
  ...(variant && variant !== 'inherit' ? theme.typography[variant] : undefined),
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
      titleVariant = 'h2',
      icon,
      badge,
      description,
      actions,
      toolbar,
      sx,
      ...rest
    },
    ref
  ) => {
    const fullRow = (area: string) => (actions ? `"${area} ${area}"` : `"${area}"`);
    const narrowAreas = [
      '"title"',
      description && '"description"',
      actions && '"actions"',
      toolbar && '"toolbar"',
    ];
    const wideAreas = [
      actions ? '"title actions"' : '"title"',
      description && fullRow('description'),
      toolbar && fullRow('toolbar'),
    ];

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
        sx={[{ containerType: 'inline-size' }, ...(Array.isArray(sx) ? sx : [sx])]}
        {...rest}
      >
        <Box
          sx={(theme) => ({
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gridTemplateAreas: narrowAreas.filter(Boolean).join(' '),
            columnGap: 2,
            rowGap: 1,
            [wide(theme)]: {
              gridTemplateColumns: actions ? 'minmax(0, 1fr) fit-content(50%)' : 'minmax(0, 1fr)',
              gridTemplateAreas: wideAreas.filter(Boolean).join(' '),
            },
          })}
        >
          <Box
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
          {actions && (
            <Box
              sx={(theme) => ({
                gridArea: 'actions',
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'start',
                [wide(theme)]: { '&::before': titleLineStrut(theme, titleVariant) },
              })}
            >
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1,
                  [wide(theme)]: { justifyContent: 'flex-end' },
                })}
              >
                {actions}
              </Box>
            </Box>
          )}
          {toolbar && (
            <Box
              sx={{
                gridArea: 'toolbar',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                mt: 1,
              }}
            >
              {toolbar}
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export default PageHeader;
