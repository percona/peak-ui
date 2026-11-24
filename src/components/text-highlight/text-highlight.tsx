import { forwardRef, useMemo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { TextHighlightProps } from './text-highlight.types';
import { getMatchRanges, normalizeRanges } from './text-highlight.utils';

const TextHighlight = forwardRef<HTMLSpanElement, TextHighlightProps>(
  ({ text, query = '', ranges, ...rest }, ref) => {
    const marks = useMemo(
      () => (ranges ? normalizeRanges(ranges, text.length) : getMatchRanges(text, query)),
      [ranges, text, query]
    );

    const parts: ReactNode[] = [];
    let cursor = 0;
    marks.forEach(([start, end]) => {
      if (start > cursor) {
        parts.push(text.slice(cursor, start));
      }
      parts.push(
        <Box
          key={start}
          component="mark"
          sx={{ bgcolor: 'transparent', color: 'inherit', fontWeight: 'fontWeightBold' }}
        >
          {text.slice(start, end)}
        </Box>
      );
      cursor = end;
    });
    if (cursor < text.length) {
      parts.push(text.slice(cursor));
    }

    return (
      <Box ref={ref} component="span" {...rest}>
        {parts}
      </Box>
    );
  }
);

TextHighlight.displayName = 'TextHighlight';

export default TextHighlight;
