import { Children, forwardRef, isValidElement } from 'react';
import Box from '@mui/material/Box';
import { mergeSx } from '@/utils';
import type { StatusBannerProps } from './status-banner.types';

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
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
          >
            {index > 0 && (
              <Box
                component="span"
                aria-hidden
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 24,
                  typography: 'body1',
                  color: 'text.secondary',
                }}
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
