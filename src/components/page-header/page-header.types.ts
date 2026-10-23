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
   * Visual size of the title, any typography variant; h3 (33px) suits a page, h2 reads too large beside a sidebar.
   * @default 'h3'
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
  /** Page-wide filters, freshness and view switches: a row under the title, or on the title's row with `toolbarPlacement="inline"`. */
  toolbar?: ReactNode;
  /**
   * `inline` puts the toolbar on the title's row, between the title and the actions, once the header is md wide; narrower, it stacks under the title.
   * @default 'below'
   */
  toolbarPlacement?: 'below' | 'inline';
  /** A rule under the header that sets it apart from the page. */
  divider?: boolean;
}
