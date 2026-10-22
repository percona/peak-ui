import { useState, type MouseEvent } from 'react';
import { type Meta, type StoryObj } from '@storybook/react';
import * as DocBlock from '@storybook/addon-docs/blocks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { listItemTextClasses } from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import type { KeyboardShortcut } from '../kbd';
import NavItem from '../nav-item';
import SearchTrigger from './search-trigger';

const SHORTCUT: KeyboardShortcut = {
  keys: ['⌘', 'K'],
  text: '⌘K',
  spoken: 'Command K',
  ariaKeyShortcuts: 'Meta+K',
};

// The drawer timing a sidebar would pass: slower opening than closing, on the sharp curve.
const SIDEBAR_OPENING = 250;
const SIDEBAR_CLOSING = 125;

const ENTRIES = [
  { text: 'Overview', icon: <HomeOutlined />, selected: true },
  { text: 'Dashboards', icon: <DashboardOutlined /> },
  { text: 'Alerts', icon: <NotificationsOutlined /> },
];

const Sidebar = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [typed, setTyped] = useState('');
  const transition = {
    duration: open ? SIDEBAR_OPENING : SIDEBAR_CLOSING,
    easing: theme.transitions.easing.sharp,
  };
  // The rail row a sidebar gives its entries: square, with the 24px icon centred in 48px.
  const railEntry = {
    overflow: 'hidden',
    transition: theme.transitions.create(['padding', 'border-radius'], transition),
    [`.${listItemTextClasses.root}`]: {
      flexShrink: 0,
      opacity: open ? 1 : 0,
      transition: theme.transitions.create('opacity', transition),
    },
    ...(!open && { px: 1.5, borderRadius: 0 }),
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <Button variant="outlined" size="small" onClick={() => setOpen(!open)}>
        {open ? 'Collapse the sidebar' : 'Expand the sidebar'}
      </Button>
      <Box
        component="nav"
        aria-label="Main"
        sx={{
          width: open ? 288 : 48,
          py: 1,
          borderRight: 1,
          borderColor: 'divider',
          transition: theme.transitions.create('width', transition),
        }}
      >
        <List disablePadding>
          <ListItem disablePadding>
            <SearchTrigger
              collapsed={!open}
              shortcut={SHORTCUT}
              morphTransition={transition}
              onClick={() => setTyped('')}
              onTypeAhead={setTyped}
            />
          </ListItem>
          {ENTRIES.map((entry) => (
            <ListItem key={entry.text} disablePadding>
              <NavItem
                component="a"
                href="#"
                onClick={(event: MouseEvent) => event.preventDefault()}
                text={entry.text}
                icon={entry.icon}
                selected={entry.selected}
                sx={railEntry}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Typography variant="body2" color="text.secondary" aria-live="polite">
        {typed ? `Typed while focused: ${typed}` : 'Focus Search and type a letter.'}
      </Typography>
    </Box>
  );
};

const meta: Meta<typeof SearchTrigger> = {
  title: 'Navigation/Search Trigger',
  component: SearchTrigger,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'The navigation entry that opens a search dialog, such as `SearchDialog`: a `NavItem` row with a search icon, the label and the shortcut caps, for the top of a sidebar. It is a button, not an input: to filter a list in place, use `TextField`.',
          '',
          'It is built on `NavItem`, so it shares the entries\' height, padding, type, hover and focus, and sits flush against the entry below it. Pass `shortcut` to draw its caps with `Kbd` at the end of the row. The same shortcut sets `aria-keyshortcuts`, describes the button ("Shortcut: Command K", or `shortcutDescription`) and fills the collapsed tooltip. Peak UI does not listen for the shortcut: the app owns the global key listener and picks ⌘ or Ctrl.',
          '',
          '`collapsed` turns the same element into the square icon row of a sidebar rail, with a tooltip; its padding, corners and label change in step with the sidebar instead of remounting, so pass the sidebar timing as `morphTransition` and give the other entries the same rail shape. The label stays in the DOM in both forms and names the button. The caps fade in once the row has mostly widened; with reduced motion nothing animates.',
          '',
          '**Type-ahead:** with `onTypeAhead`, a printable character typed while the button has focus is handed over, so the app can open the dialog with it as the query. Enter and Space click the button as usual.',
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
    label: 'Search',
    shortcut: SHORTCUT,
    collapsed: false,
  },
  argTypes: {
    label: { control: 'text', description: 'Visible text and accessible name in both forms.' },
    shortcut: {
      control: 'object',
      description: 'A `KeyboardShortcut` the app resolved for the platform.',
    },
    collapsed: { control: 'boolean', description: 'The icon-only form for a sidebar rail.' },
    tooltipPlacement: { control: 'select', options: ['right', 'bottom', 'left', 'top'] },
    icon: { control: false },
    morphTransition: { control: false },
  },
  render: (args) => (
    <Box sx={{ width: args.collapsed ? 48 : 288 }}>
      <SearchTrigger {...args} />
    </Box>
  ),
};

export default meta;
type Story = StoryObj<typeof SearchTrigger>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  args: { collapsed: true },
  parameters: {
    docs: {
      description: {
        story:
          'Hover or focus it for half a second to see the tooltip with the label and shortcut.',
      },
    },
  },
};

export const WithoutShortcut: Story = {
  args: { shortcut: undefined },
};

export const InASidebar: Story = {
  render: () => <Sidebar />,
  parameters: {
    docs: {
      description: {
        story:
          'Search heads the entries with the same rhythm, and one element morphs between the expanded row and the rail row as the sidebar opens and closes.',
      },
    },
  },
};
