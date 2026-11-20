import { useMemo, useState, type ComponentProps } from 'react';
import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Box from '@mui/material/Box';
import AddOutlined from '@mui/icons-material/AddOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import KeyboardOutlined from '@mui/icons-material/KeyboardOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import type { KeyboardShortcut } from '../kbd';
import SearchTrigger from '../search-trigger';
import SearchDialog from './search-dialog';
import SearchDialogOption from './search-dialog-option';
import type { SearchDialogGroup, SearchDialogItem } from './search-dialog.types';

const SHORTCUT: KeyboardShortcut = {
  keys: ['Ctrl', 'K'],
  text: 'Ctrl+K',
  spoken: 'Control K',
  ariaKeyShortcuts: 'Control+K',
};

const KEY_HINTS = [
  { keys: ['↑', '↓'], label: 'Navigate' },
  { keys: ['↵'], label: 'Open' },
  { keys: ['Ctrl', '↵'], label: 'Open in a new tab' },
  { keys: ['Esc'], label: 'Close' },
];

const opensInNewTab = <OpenInNewOutlined fontSize="small" />;

const CATALOG: SearchDialogGroup[] = [
  {
    id: 'pages',
    label: 'Pages',
    items: [
      { id: 'home', label: 'Home', icon: <HomeOutlined /> },
      {
        id: 'reports',
        label: 'Reports',
        description: 'Usage and trends',
        icon: <AssessmentOutlined />,
      },
      {
        id: 'members',
        label: 'Members',
        description: ['Organization', 'Members'],
        icon: <PeopleOutlined />,
      },
      {
        id: 'billing',
        label: 'Billing',
        description: ['Organization', 'Billing'],
        icon: <CreditCardOutlined />,
      },
      {
        id: 'profile',
        label: 'Profile settings',
        description: ['Settings', 'Profile'],
        icon: <SettingsOutlined />,
      },
      {
        id: 'security',
        label: 'Security settings',
        description: ['Settings', 'Security'],
        icon: <SettingsOutlined />,
      },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'new-report', label: 'Create a report', icon: <AddOutlined /> },
      { id: 'invite', label: 'Invite a member', icon: <PersonAddOutlined /> },
      { id: 'theme', label: 'Switch to dark mode', icon: <DarkModeOutlined /> },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      {
        id: 'docs',
        label: 'Documentation',
        description: 'Help · opens in a new tab',
        icon: <MenuBookOutlined />,
        meta: opensInNewTab,
      },
      { id: 'shortcuts', label: 'Keyboard shortcuts', icon: <KeyboardOutlined /> },
      {
        id: 'support',
        label: 'Contact support',
        description: 'Help · opens in a new tab',
        icon: <SupportAgentOutlined />,
        meta: opensInNewTab,
      },
    ],
  },
];

const RECENT: SearchDialogGroup = {
  id: 'recent',
  label: 'Recent',
  items: [
    {
      id: 'recent-reports',
      label: 'Reports',
      description: 'Usage and trends',
      icon: <HistoryOutlined />,
    },
    {
      id: 'recent-billing',
      label: 'Billing',
      description: ['Organization', 'Billing'],
      icon: <HistoryOutlined />,
    },
  ],
};

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const searchableText = (item: SearchDialogItem) =>
  fold([item.label, ...[item.description ?? []].flat()].join(' '));

// The app owns matching and ranking; a plain "every term appears" filter is enough here.
const filterCatalog = (query: string) => {
  const terms = fold(query).split(/\s+/).filter(Boolean);

  return CATALOG.map((group) => ({
    ...group,
    items: group.items.filter((item) => terms.every((term) => searchableText(item).includes(term))),
  }));
};

type DemoProps = Partial<ComponentProps<typeof SearchDialog>> & {
  initialQuery?: string;
  inDocs?: boolean;
};

const Demo = ({ initialQuery = '', groups, inDocs = false, slotProps, ...props }: DemoProps) => {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState('');
  const results = useMemo(
    () => groups ?? (query.trim() ? filterCatalog(query) : [RECENT, ...CATALOG.slice(1)]),
    [groups, query]
  );

  const openWith = (text: string) => {
    setQuery(text);
    setOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 288 }}>
      <SearchTrigger shortcut={SHORTCUT} onClick={() => openWith('')} onTypeAhead={openWith} />
      <Box
        component="p"
        sx={{ m: 0, typography: 'body2', color: 'text.secondary' }}
        aria-live="polite"
      >
        {selected ? `Selected: ${selected}` : 'Pick a result with Enter or a click.'}
      </Box>
      <SearchDialog
        open={open}
        onClose={() => setOpen(false)}
        query={query}
        onQueryChange={setQuery}
        groups={results}
        onSelect={(item, { newTab }) => {
          setSelected(`${item.label}${newTab ? ' (new tab)' : ''}`);
          setOpen(false);
        }}
        placeholder="Search pages, actions and help"
        keyHints={KEY_HINTS}
        labels={{ noResultsHint: 'Check the spelling, or try a broader term.' }}
        // On the docs page each story opens on load in a frame of its own, and none takes focus from the page.
        slotProps={{
          ...slotProps,
          dialog: { disableAutoFocus: inDocs, disableEnforceFocus: inDocs, ...slotProps?.dialog },
          input: { autoFocus: !inDocs, ...slotProps?.input },
        }}
        {...props}
      />
    </Box>
  );
};

const meta: Meta<typeof SearchDialog> = {
  title: 'Navigation/Search Dialog',
  component: SearchDialog,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'padded',
    docs: {
      story: { inline: false, iframeHeight: '560px' },
      description: {
        component: [
          "A global search panel: a dialog anchored near the top of the screen, with a search input and the results under it in named groups. Open it from a `SearchTrigger` and from the app's own shortcut.",
          '',
          "The app owns the data. Pass `query` and `groups` already filtered, ranked and capped, and update them from `onQueryChange`; the dialog draws what it is given and keeps the input where it is as the results change. `onSelect` reports Enter or a click, with `newTab` for ⌘ or Ctrl, or a middle click, and never closes the dialog by itself. The global shortcut, platform key caps and ranking stay in the app; `getMatchRanges` keeps the bold text in step with the app's matching.",
          '',
          '**Keyboard:** focus stays in the input, a combobox over a listbox. The first result is highlighted and Enter opens it without any arrow press. Up and Down move and wrap round, Page Up and Page Down move by eight, Ctrl+Home and Ctrl+End or ⌘ with Up and Down go to the ends, and `ctrlNavigation` adds Ctrl+N and Ctrl+P. Escape closes in one press; the clear button empties the query.',
          '',
          '**Screen readers:** the active option is announced as arrows move it, but not when the pointer highlights a row. 500 ms after the results settle, a polite status announces their count and the top result (`getStatusMessage` to change it). `loading` sets `aria-busy` at once and shows a spinner after `loadingDelay`.',
          '',
          "**Rows:** each item draws as a `SearchDialogOption`: icon, label in bold where it matches, a description or breadcrumb, and decorative `meta`. `renderOption` replaces the content, never the option element. An item with `status: 'error'` shows an error icon and stays selectable, for a row that retries. Below 600px the dialog fills the screen and adds a close button.",
        ].join('\n'),
      },
      page: () => (
        <>
          <DocBlock.Title />
          <DocBlock.Subtitle />
          <DocBlock.Description />
          <DocBlock.Primary />
          <DocBlock.Stories includePrimary={false} />
        </>
      ),
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchDialog>;

export const Default: Story = {
  render: (_args, { viewMode }) => <Demo inDocs={viewMode === 'docs'} initialQuery="set" />,
  parameters: {
    docs: {
      description: {
        story:
          'Type to filter, move with the arrow keys and press Enter; reopen it from the trigger, or by typing a letter while the trigger has focus.',
      },
    },
  },
};

export const ZeroQuery: Story = {
  render: (_args, { viewMode }) => <Demo inDocs={viewMode === 'docs'} />,
  parameters: {
    docs: {
      description: {
        story: 'Before anything is typed, the app can offer recent places and common actions.',
      },
    },
  },
};

export const Loading: Story = {
  render: (_args, { viewMode }) => (
    <Demo
      inDocs={viewMode === 'docs'}
      initialQuery="rep"
      loading
      groups={[{ ...CATALOG[0], items: CATALOG[0].items.slice(1, 2) }]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Results already found stay usable while more load; the spinner shows once loading has taken 300 ms.',
      },
    },
  },
};

export const ErrorRow: Story = {
  render: (_args, { viewMode }) => (
    <Demo
      inDocs={viewMode === 'docs'}
      initialQuery="rep"
      groups={[
        { ...CATALOG[0], items: CATALOG[0].items.slice(1, 2) },
        {
          id: 'remote',
          label: 'Shared reports',
          items: [
            {
              id: 'retry',
              label: "Couldn't load shared reports",
              description: 'Select to try again',
              status: 'error',
            },
          ],
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A source that failed is a selectable row with an error icon, so trying again is one Enter away.',
      },
    },
  },
};

export const NoResults: Story = {
  render: (_args, { viewMode }) => <Demo inDocs={viewMode === 'docs'} initialQuery="xyzzy" />,
  parameters: {
    docs: {
      description: {
        story:
          'The listbox is hidden and the empty state shows the query, with an optional hint in `labels.noResultsHint`.',
      },
    },
  },
};

export const OptionRow: Story = {
  render: () => (
    <Box
      role="listbox"
      aria-label="Example results"
      sx={(theme) => ({
        width: 640,
        maxWidth: '100%',
        py: 1,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: `${theme.shape.borderRadiusMd}px`,
      })}
    >
      {[
        { label: 'Reports', icon: <AssessmentOutlined /> },
        { label: 'Members', description: ['Organization', 'Members'], icon: <PeopleOutlined /> },
        {
          label: 'Documentation',
          description: 'Help · opens in a new tab',
          icon: <MenuBookOutlined />,
          meta: opensInNewTab,
        },
        {
          label: "Couldn't load shared reports",
          description: 'Select to try again',
          status: 'error' as const,
        },
      ].map((option) => (
        <Box
          key={option.label}
          role="option"
          aria-selected={false}
          sx={{ display: 'flex', alignItems: 'center', minHeight: 40, px: 2 }}
        >
          <SearchDialogOption {...option} query="re" />
        </Box>
      ))}
    </Box>
  ),
  parameters: {
    docs: {
      story: { inline: true },
      description: {
        story:
          '`SearchDialogOption` on its own: one line, a breadcrumb, trailing meta and an error row. Use it inside `renderOption` to change one part of a row.',
      },
    },
  },
};
