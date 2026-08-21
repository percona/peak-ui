import { ReactNode } from 'react';
import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';
import CardContent, { type CardContentProps } from '@mui/material/CardContent';
import CardHeader, { type CardHeaderProps } from '@mui/material/CardHeader';

export interface OverviewCardProps extends Omit<MuiCardProps, 'content'> {
  cardHeaderProps?: CardHeaderProps;
  cardContentProps?: CardContentProps;
  dataTestId: string;
  children: ReactNode;
}

const OverviewCard = ({
  cardHeaderProps,
  children,
  sx,
  cardContentProps,
  dataTestId,
  ...props
}: OverviewCardProps) => {
  return (
    <MuiCard
      variant="grey"
      sx={{ width: '368px', height: 'fit-content', ...sx }}
      data-testid={dataTestId}
      {...props}
    >
      {cardHeaderProps?.title && (
        <CardHeader
          data-testid={`${dataTestId}-card-header`}
          title={cardHeaderProps?.title}
          {...cardHeaderProps}
        />
      )}
      <CardContent {...cardContentProps}>{children}</CardContent>
    </MuiCard>
  );
};

export default OverviewCard;
