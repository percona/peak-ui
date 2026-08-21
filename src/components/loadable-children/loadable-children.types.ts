import { SkeletonProps } from '@mui/material/Skeleton';

export type LoadableChildrenProps = {
  children: React.ReactNode;
  loading?: boolean;
  skeletonProps?: SkeletonProps;
};
