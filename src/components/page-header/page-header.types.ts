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
   * Visual size of the title, any typography variant; h4 (28px) suits a page beside a sidebar, h3 and larger read too loud there.
   * @default 'h4'
   */
  titleVariant?: TypographyProps['variant'];
  /** A product or technology mark before the title; decorative (aria-hidden). */
  icon?: ReactNode;
  /** Chips after the title, such as a preview level or "Sample data". */
  badge?: ReactNode;
  /** One line under the title: a subtitle or a status summary; may contain links. */
  description?: ReactNode;
  /** Page-level actions; right of the title, in at most half the row, once the header itself is md (900px) wide; under the description when it is narrower. With an inline toolbar they stay beside the title at any width. */
  actions?: ReactNode;
  /** Page-wide filters, freshness and view switches: a row under the title, or on the title's row with `toolbarPlacement="inline"`. */
  toolbar?: ReactNode;
  /**
   * `inline` puts the toolbar on the title's row, between the title and the actions, whenever the title, the toolbar on one line and the actions fit side by side, at any width. Otherwise the whole toolbar moves under the title as one block, and only there do its items wrap.
   * @default 'below'
   */
  toolbarPlacement?: 'below' | 'inline';
  /** A rule under the header that sets it apart from the page. */
  divider?: boolean;
}
