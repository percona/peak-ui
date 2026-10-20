import { useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddOutlined from '@mui/icons-material/AddOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import Chip from '../chip';
import { PerconaMoIcon } from '../icons';
import PageContainer from '../page-container';
import StatusIcon from '../status-icon';
import Tooltip from '../tooltip';
import PageHeader from './page-header';

const ENVIRONMENTS = ['All environments', 'prod', 'staging', 'No environment'];

const statusLine = (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
    <StatusIcon severity="error" size="small" />
    <span>
      <Link href="#clusters">3 clusters</Link> · <Link href="#attention">3 need attention</Link> ·
      last good backup <Link href="#backups">6h ago</Link>
    </span>
  </Box>
);

const sampleData = <Chip size="small" color="info" variant="outlined" label="Sample data" />;

const actions = (
  <>
    <Button variant="contained" startIcon={<AddOutlined />}>
      Add MongoDB service
    </Button>
    <Button variant="outlined">Install MongoDB</Button>
  </>
);

const EnvironmentSelect = () => {
  const [environment, setEnvironment] = useState(ENVIRONMENTS[0]);

  return (
    <TextField
      select
      size="small"
      label="Environment"
      value={environment}
      onChange={(event) => setEnvironment(event.target.value)}
      sx={{ minWidth: 200 }}
    >
      {ENVIRONMENTS.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
};

const toolbar = (
  <>
    <EnvironmentSelect />
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        Updated 20s ago
      </Typography>
      <Tooltip title="Refresh">
        <IconButton size="small" aria-label="Refresh">
          <RefreshRounded fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </>
);

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The top of a page: its single `h1` with an optional decorative mark and badge, a one-line description, actions, and an optional toolbar for page-wide filters, in its own row or, with `toolbarPlacement=\"inline\"`, on the title's row. `divider` draws a rule under it. Use it as the first child of `PageContainer`. Once the header itself is `md` (900px) wide, the actions sit right of the title, centred on its first line, and take at most half the row; narrower, they move under the description. The header's own width decides, not the viewport's, so a docked sidebar beside the page counts. Slots you leave out render nothing. Switch the color mode from the Storybook toolbar to check dark mode.",
      },
    },
  },
  args: {
    title: 'MongoDB',
  },
  argTypes: {
    titleComponent: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3'],
    },
    titleVariant: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    icon: { control: false },
    badge: { control: false },
    description: { control: false },
    actions: { control: false },
    toolbar: { control: false },
    toolbarPlacement: { control: { type: 'inline-radio' }, options: ['below', 'inline'] },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithDescription: Story = {
  args: {
    title: 'Help center',
    description: 'Guides, community and support for Percona Monitoring and Management.',
  },
};

export const WithIconAndBadge: Story = {
  args: {
    icon: <PerconaMoIcon fontSize="large" />,
    badge: sampleData,
    description: statusLine,
  },
};

export const WithActions: Story = {
  args: {
    icon: <PerconaMoIcon fontSize="large" />,
    description: statusLine,
    actions,
  },
};

export const WithToolbar: Story = {
  args: {
    icon: <PerconaMoIcon fontSize="large" />,
    badge: sampleData,
    description: statusLine,
    actions,
    toolbar,
  },
};

// The hub layout: scope and freshness on the title's row, quiet actions at its end, a rule under it.
export const InlineToolbar: Story = {
  args: {
    icon: <PerconaMoIcon sx={{ fontSize: 36 }} />,
    toolbar,
    toolbarPlacement: 'inline',
    divider: true,
    actions: (
      <>
        <Button variant="text" startIcon={<AddOutlined />}>
          Add MongoDB
        </Button>
        <IconButton aria-label="More actions">
          <MoreVertOutlined />
        </IconButton>
      </>
    ),
  },
};

export const LongTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The title wraps in its own column; the icon, the badge and the actions stay on its first line.',
      },
    },
  },
  args: {
    title: 'Replica sets and sharded clusters in the production environment',
    icon: <PerconaMoIcon fontSize="large" />,
    badge: sampleData,
    description: statusLine,
    actions,
  },
};

export const Narrow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'At 360px the actions and the toolbar move under the description and wrap.',
      },
    },
  },
  render: (args) => (
    <Box sx={{ width: 360 }}>
      <PageHeader {...args} />
    </Box>
  ),
  args: WithToolbar.args,
};

export const BesideSidebar: Story = {
  name: 'Beside a docked sidebar',
  parameters: {
    docs: {
      description: {
        story:
          'A 900px viewport with a docked 289px sidebar and the page padding leaves the header about 530px. It is narrower than `md` itself, so it stays stacked instead of squeezing the title beside the actions.',
      },
    },
  },
  render: (args) => (
    <Box sx={{ width: 532 }}>
      <PageHeader {...args} />
    </Box>
  ),
  args: WithToolbar.args,
};

export const Medium: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'From 900px (`md`) of its own width the actions move up beside the title. They take at most half the row and wrap inside it, so the title keeps the other half.',
      },
    },
  },
  render: (args) => (
    <Box sx={{ width: 900 }}>
      <PageHeader {...args} />
    </Box>
  ),
  args: WithToolbar.args,
};

export const InsidePageContainer: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <PageContainer maxWidth="full">
      <PageHeader {...args} />
      <Box sx={{ p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="body1">Page content</Typography>
      </Box>
    </PageContainer>
  ),
  args: WithToolbar.args,
};
