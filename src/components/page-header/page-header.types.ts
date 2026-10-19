import type { BoxProps } from '@mui/material/Box';
import type { TypographyProps } from '@mui/material/Typography';
import type { ElementType, ReactNode } from 'react';

export interface PageHeaderProps extends Omit<BoxProps, 'title' | 'children'> {
  /** The page name, rendered as the page's main heading. */
  title: ReactNode;
  /**
   * Heading element. A page has exactly one h1.
   * @default 'h1'
   */
  titleComponent?: ElementType;
  /**
   * Visual size of the title.
   * @default 'h2'
   */
  titleVariant?: TypographyProps['variant'];
  /** A product or technology mark before the title; decorative (aria-hidden). */
  icon?: ReactNode;
  /** Chips after the title, such as a preview level or "Sample data". */
  badge?: ReactNode;
  /** One line under the title: a subtitle or a status summary; may contain links. */
  description?: ReactNode;
  /** Page-level actions; right of the title, in at most half the row, once the header itself is md (900px) wide; under the description when it is narrower. */
  actions?: ReactNode;
  /** A second row for page-wide filters, freshness and view switches. */
  toolbar?: ReactNode;
}
