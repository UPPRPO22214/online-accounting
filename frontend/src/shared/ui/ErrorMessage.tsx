import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';

type ErrorMessageProps = HTMLAttributes<HTMLSpanElement> & {
  message?: string;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className,
  ...props
}) => {
  if (!message) return;

  return (
    <span className={clsx('text-orange-800', className)} {...props}>
      {message}
    </span>
  );
};
