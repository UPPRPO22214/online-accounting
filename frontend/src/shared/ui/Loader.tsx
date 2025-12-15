import { CogIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

type LoaderProps = HTMLAttributes<SVGElement> & {
  isLoading?: boolean;
};

export const Loader: React.FC<LoaderProps> = ({
  isLoading = true,
  className,
  ...props
}) => {
  return (
    <>
      {isLoading && (
        <CogIcon
          className={clsx('size-4 transition-base animate-spin', className)}
          {...props}
        />
      )}
    </>
  );
};
