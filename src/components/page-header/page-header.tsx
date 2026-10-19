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
        sx={[
          {
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: actions ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
            },
            gridTemplateAreas: {
              xs: narrowAreas.filter(Boolean).join(' '),
              md: wideAreas.filter(Boolean).join(' '),
            },
            columnGap: 2,
            rowGap: 1,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
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
            sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
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
              [theme.breakpoints.up('md')]: { '&::before': titleLineStrut(theme, titleVariant) },
            })}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 1,
              }}
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
    );
  }
);

PageHeader.displayName = 'PageHeader';

export default PageHeader;
