import React from 'react';
import clsx from 'clsx';
import { ButtonSize, ButtonVariant, ButtonProps } from '../Button';

export const IconButtonVariant = ButtonVariant;
export const IconButtonSize = ButtonSize;

type IconButtonProps = ButtonProps & {
  icon?: React.ReactNode;
};

const IconButton = ({
  children,
  className,
  variant = IconButtonVariant.SECONDARY,
  sizeType = IconButtonSize.DEFAULT,
  disabled = false,
  type = 'button',
  icon,
  ...props
}: IconButtonProps & React.HTMLProps<HTMLButtonElement>) => (
  <button
    className={clsx('btn', variant, sizeType, className, 'flex items-center')}
    disabled={disabled}
    // eslint-disable-next-line react/button-has-type
    type={type}
    {...props}>
    <div className="pr-1">{icon}</div>
    {children}
  </button>
);

export default IconButton;
