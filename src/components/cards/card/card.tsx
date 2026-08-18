import { ReactNode } from 'react';
import { kebabize } from '@/utils';

import MuiCard from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { CardProps as MuiCardProps } from '@mui/material/Card';
import { ButtonProps } from '@mui/material/Button';
import { TypographyProps } from '@mui/material/Typography';
import { CardContentProps } from '@mui/material/CardContent';
import { BoxProps } from '@mui/material/Box';
import { CardActionsProps } from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';

export interface CardProps extends Omit<MuiCardProps, 'content'> {
  content: ReactNode;
  dataTestId: string;
  cardActions?: ActionProps[];
  cardActionsProps?: CardActionsProps;
  headerProps?: TypographyProps;
  cardContentProps?: CardContentProps;
  contentWrapperProps?: BoxProps;
}

export interface ActionProps extends ButtonProps {
  text: string;
}

const Card = ({
  title,
  content,
  sx,
  cardActions,
  headerProps,
  cardContentProps,
  contentWrapperProps,
  cardActionsProps,
  dataTestId,
  ...props
}: CardProps) => {
  return (
    <MuiCard
      data-testid={`${dataTestId}-card`}
      sx={{ width: '320px', height: 'fit-content', ...sx }}
      {...props}
    >
      <CardContent
        data-testid={`${dataTestId}-card-content`}
        {...cardContentProps}
        sx={{
          '&:last-child': {
            p: 2,
          },
          ...cardContentProps?.sx,
        }}
      >
        {title && (
          <Typography
            data-testid={`${dataTestId}-card-header`}
            variant="h5"
            {...headerProps}
            sx={{ mb: 4, ...headerProps?.sx }}
          >
            {title}
          </Typography>
        )}
        <Box data-testid={`${dataTestId}-card-content-wrapper`} {...contentWrapperProps}>
          {content}
        </Box>
        {cardActions && (
          <CardActions
            data-testid={`${dataTestId}-card-actions`}
            {...cardActionsProps}
            sx={{ p: 0, mt: 4, ...cardActionsProps?.sx }}
          >
            {cardActions.map(({ text, ...buttonProps }) => (
              <Button key={text} data-testid={`${kebabize(text)}-button`} {...buttonProps}>
                {text}
              </Button>
            ))}
          </CardActions>
        )}
      </CardContent>
    </MuiCard>
  );
};

export default Card;
