import React from 'react';
import clsx from 'clsx';

export enum ButtonVariant {
  PRIMARY = 'btn-primary',
  SECONDARY = 'btn-secondary',
  OUTLINE = 'btn-outline',
  OUTLINE_PRIMARY = 'btn-outline-primary',
  DANGER = 'btn-danger',
  SUCCESS = 'btn-success',
}

export enum ButtonSize {
  DEFAULT = '',
  NORMAL = 'w-24',
  MEDIUM = 'w-32',
  LARGE = 'w-40',
  EXTRA_LARGE = 'w-48',
}

export type ButtonProps = {
  variant?: ButtonVariant;
  disabled?: boolean;
  sizeType?: ButtonSize;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: 'button' | 'submit' | 'reset';
};

const Button = ({
  children,
  className,
  onClick,
  variant = ButtonVariant.SECONDARY,
  sizeType = ButtonSize.DEFAULT,
  disabled = false,
  type = 'button',
  ...props
}: ButtonProps & React.HTMLProps<HTMLButtonElement>) => (
  <button
    className={clsx('btn', variant, sizeType, className)}
    onClick={onClick}
    disabled={disabled}
    {...props}>
    {children}
  </button>
);

export default Button;
