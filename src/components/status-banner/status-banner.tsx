import { Children, forwardRef, isValidElement } from 'react';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import { mergeSx } from '@/utils';
import type { StatusBannerProps } from './status-banner.types';

// The banner's own width decides, not the viewport's: below sm each facet takes a line and the dashes go.
const narrow = (theme: Theme) => theme.containerQueries.down('sm');

/** A page's status in one line: a few StateIndicators, one per facet, with dashes between them. */
const StatusBanner = forwardRef<HTMLUListElement, StatusBannerProps>(
  ({ children, sx, ...rest }, ref) => {
    const facets = Children.toArray(children);

    return (
      <Box
        ref={ref}
        component="ul"
        // list-style: none drops the list role in Safari.
        role="list"
        sx={mergeSx(
          {
            containerType: 'inline-size',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: 0.5,
            m: 0,
            p: 0,
            listStyle: 'none',
          },
          sx
        )}
        {...rest}
      >
        {facets.map((facet, index) => (
          <Box
            component="li"
            key={isValidElement(facet) && facet.key != null ? facet.key : index}
            sx={(theme) => ({
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              gap: 0.5,
              minWidth: 0,
              [narrow(theme)]: { width: '100%' },
            })}
          >
            {index > 0 && (
              <Box
                component="span"
                aria-hidden
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  height: 24,
                  typography: 'body1',
                  color: 'text.secondary',
                  [narrow(theme)]: { display: 'none' },
                })}
              >
                —
              </Box>
            )}
            {facet}
          </Box>
        ))}
      </Box>
    );
  }
);

StatusBanner.displayName = 'StatusBanner';

export default StatusBanner;
