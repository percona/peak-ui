import { SxProps, Theme } from '@mui/material/styles';
import { TypographyProps } from '@mui/material/Typography';

export type LabeledContentProps = {
  label?: string;
  caption?: string;
  verticalStackChildrenSlot?: React.ReactNode;
  horizontalStackChildrenSlot?: React.ReactNode;
  isRequired?: boolean;
  verticalStackSx?: SxProps<Theme>;
  horizontalStackSx?: SxProps<Theme>;
} & TypographyProps;
