import { type Meta, type StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SeverityIcon from './severity-icon';
import type { SeverityIconSeverity } from './severity-icon.types';

const SEVERITIES: Array<[SeverityIconSeverity, string]> = [
  ['critical', 'Critical'],
  ['error', 'Error'],
  ['warning', 'Warning'],
  ['notSetUp', 'Not set up'],
  ['info', 'Info'],
];

const meta = {
  title: 'Feedback/Severity Icon',
  component: SeverityIcon,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'A severity as the State indicator draws it: `critical` is the red octagon, `error` the red diamond, `warning` the yellow triangle, `notSetUp` the circled question mark and `info` the speech bubble. Use it to mark each item in a list, such as a hub’s Needs attention and Recommendations rows, so the list reads like the status banner above it.',
          '',
          'The glyph and color are fixed per severity. The icon is decorative by default: say the severity in text nearby, or pass `titleAccess` to name it.',
        ].join('\n'),
      },
    },
  },
  args: { severity: 'critical' },
  argTypes: {
    severity: { options: SEVERITIES.map(([severity]) => severity), control: { type: 'select' } },
    size: { options: ['medium', 'small'], control: { type: 'inline-radio' } },
  },
} satisfies Meta<typeof SeverityIcon>;

export default meta;
type Story = StoryObj<typeof SeverityIcon>;

export const Playground: Story = {};

export const Severities: Story = {
  name: 'All severities',
  parameters: { controls: { disable: true } },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {SEVERITIES.map(([severity, label]) => (
        <Box key={severity} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SeverityIcon severity={severity} />
          <Typography variant="body1">{label}</Typography>
        </Box>
      ))}
    </Box>
  ),
};
