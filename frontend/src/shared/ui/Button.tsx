import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import type React from 'react';

type ButtonVariants = 'base' | 'white';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariants;
};

const BUTTON_STYLES: Record<ButtonVariants, string> = {
  white: 'hover:bg-gray-300',
  base: 'bg-gray-200 hover:bg-gray-300',
};

export const Button: React.FC<ButtonProps> = ({
  variant,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'p-1 transition-base',
        variant ? BUTTON_STYLES[variant] : BUTTON_STYLES.base,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
