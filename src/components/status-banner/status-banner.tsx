import {
  Children,
  forwardRef,
  isValidElement,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import useForkRef from '@mui/utils/useForkRef';
import { mergeSx } from '@/utils';
import StatusCard from '../status-card';
import type { StatusBannerProps } from './status-banner.types';

// The banner's own width decides, not the viewport's: below sm the facets stack, one per line.
const narrow = (theme: Theme) => theme.containerQueries.down('sm');

// 16px either side of a dot, as in Figma. The dot sits in this gap, so hiding it never moves a facet.
const DOTTED_GAP = 37;
// A card's padding; a plain facet beside cards takes it too, so the labels line up.
const CARD_INSET = 1;

const isCard = (facet: ReactNode) => isValidElement(facet) && facet.type === StatusCard;

// A dot parts two facets on one line; on a facet that wraps to open a line it would dangle, so it hides.
const useLineStarts = (list: RefObject<HTMLUListElement | null>) => {
  useLayoutEffect(() => {
    const node = list.current;

    if (!node) {
      return undefined;
    }

    const mark = () => {
      const items = Array.from(node.children) as HTMLElement[];

      items.forEach((item, index) =>
        item.toggleAttribute(
          'data-line-start',
          index > 0 && item.offsetTop > items[index - 1].offsetTop
        )
      );
    };

    mark();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(mark);

    observer.observe(node);

    return () => observer.disconnect();
  });
};

/** A page's status: a few facets, centered and wrapping, with the ones that need action on cards. */
const StatusBanner = forwardRef<HTMLUListElement, StatusBannerProps>(
  ({ children, sx, ...rest }, ref) => {
    const list = useRef<HTMLUListElement>(null);
    const handleRef = useForkRef(list, ref);
    const facets = Children.toArray(children);
    const hasCards = facets.some(isCard);

    useLineStarts(list);

    return (
      <Box
        ref={handleRef}
        component="ul"
        // list-style: none drops the list role in Safari.
        role="list"
        sx={mergeSx(
          (theme) => ({
            containerType: 'inline-size',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            rowGap: hasCards ? 2 : 1,
            columnGap: hasCards ? 2 : `${DOTTED_GAP}px`,
            m: 0,
            p: 0,
            listStyle: 'none',
            [narrow(theme)]: { flexDirection: 'column', alignItems: 'stretch', gap: 1 },
          }),
          sx
        )}
        {...rest}
      >
        {facets.map((facet, index) => {
          const card = isCard(facet);

          return (
            <Box
              component="li"
              key={isValidElement(facet) && facet.key != null ? facet.key : index}
              sx={(theme) => ({
                position: 'relative',
                display: 'flex',
                minWidth: 0,
                ...(hasCards && !card && { p: CARD_INSET }),
                '&[data-line-start] > [data-dot]': { visibility: 'hidden' },
                [narrow(theme)]: {
                  alignItems: card ? 'stretch' : 'flex-start',
                  flexDirection: 'column',
                },
              })}
            >
              {/* Cards part themselves, so only an all-plain banner has dots. */}
              {index > 0 && !hasCards && (
                <Box
                  component="span"
                  aria-hidden
                  data-dot
                  sx={(theme) => ({
                    position: 'absolute',
                    right: '100%',
                    width: DOTTED_GAP,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    typography: 'body1',
                    color: 'text.secondary',
                    [narrow(theme)]: { display: 'none' },
                  })}
                >
                  •
                </Box>
              )}
              {facet}
            </Box>
          );
        })}
      </Box>
    );
  }
);

StatusBanner.displayName = 'StatusBanner';

export default StatusBanner;
