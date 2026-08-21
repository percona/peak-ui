import React from 'react';
import { LoadableChildrenProps } from './loadable-children.types';
import Skeleton from '@mui/material/Skeleton';

const LoadableChildren = ({ children, loading, skeletonProps }: LoadableChildrenProps) => (
  <>
    {React.Children.map(children, (child) =>
      loading ? <Skeleton {...skeletonProps} /> : <>{child}</>
    )}
  </>
);

export default LoadableChildren;
