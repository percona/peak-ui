import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Typography from '@mui/material/Typography';
import TextHighlight from './text-highlight';

const meta: Meta<typeof TextHighlight> = {
  title: 'Data display/Text Highlight',
  component: TextHighlight,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Text with the parts that match a search in bold, for search results and filtered lists. It renders a `span`, so wrap it in the `Typography` the text needs.',
          '',
          '`query` marks each whitespace-separated term once, ignoring case and accents: at the first word that starts with it, otherwise at its first match inside a word. Pass `ranges` instead to mark exactly what your own matching found; `getMatchRanges(text, query)` returns the ranges `query` would mark, so ranking and highlight can share one rule.',
          '',
          'Matches are `<mark>` elements in the font weight of bold, never in a colour of their own, so the highlight does not rely on colour alone and stays legible on a selected row.',
        ].join('\n'),
      },
      page: () => (
        <>
          <DocBlock.Title />
          <DocBlock.Subtitle />
          <DocBlock.Description />
          <DocBlock.Primary />
          <DocBlock.Controls />
          <DocBlock.Stories />
        </>
      ),
    },
  },
  args: {
    text: 'Banana analytics',
    query: 'ana',
  },
  argTypes: {
    text: { control: 'text', description: 'The text to draw.' },
    query: {
      control: 'text',
      description: 'Each whitespace-separated term is marked once, ignoring case and accents.',
    },
    ranges: {
      control: 'object',
      description: 'Explicit `[start, end)` ranges to mark; wins over `query`.',
    },
  },
  render: (args) => (
    <Typography variant="body1">
      <TextHighlight {...args} />
    </Typography>
  ),
};

export default meta;
type Story = StoryObj<typeof TextHighlight>;

export const Default: Story = {};

export const SeveralTerms: Story = {
  args: { text: 'Service summary for the primary node', query: 'sum prim' },
};

export const Accents: Story = {
  args: { text: 'Résumé des médias', query: 'resume medias' },
  parameters: {
    docs: { description: { story: 'Accents and case are ignored on both sides.' } },
  },
};

export const ExplicitRanges: Story = {
  args: {
    text: 'Query analytics',
    query: undefined,
    ranges: [
      [0, 1],
      [6, 9],
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Ranges from your own matching, such as a fuzzy matcher, win over `query`.',
      },
    },
  },
};
