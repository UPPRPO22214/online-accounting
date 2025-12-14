import { CogIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

type LoaderProps = HTMLAttributes<SVGElement> & {
  isLoading: boolean;
};

export const Loader: React.FC<LoaderProps> = ({
  isLoading,
  className,
  ...props
}) => {
  return (
    <CogIcon
      className={clsx('size-4', isLoading && 'animate-spin', className)}
      {...props}
    />
  );
};
