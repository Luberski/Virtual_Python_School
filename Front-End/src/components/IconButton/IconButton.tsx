import type React from 'react';
import clsx from 'clsx';
import type { ButtonProps } from '@app/components/Button';
import { ButtonSize, ButtonVariant } from '@app/components/Button';

export const IconButtonVariant = ButtonVariant;
export const IconButtonSize = ButtonSize;

export const IconPosition = {
  LEFT: 'left',
  RIGHT: 'right',
};

export type IconButtonProps = ButtonProps & {
  icon?: React.ReactNode;
  iconPosition?: typeof IconPosition[keyof typeof IconPosition];
};

const IconButton = ({
  children,
  className,
  variant = IconButtonVariant.SECONDARY,
  sizeType = IconButtonSize.DEFAULT,
  disabled = false,
  type = 'button',
  iconPosition = IconPosition.LEFT,
  icon,
  ...props
}: IconButtonProps & React.HTMLProps<HTMLButtonElement>) => (
  <button
    className={clsx('btn', 'flex items-center', variant, sizeType, className)}
    disabled={disabled}
    // eslint-disable-next-line react/button-has-type
    type={type}
    {...props}>
    {iconPosition === IconPosition.LEFT ? (
      <>
        <div className="pr-1">{icon}</div>
        {children}
      </>
    ) : (
      <>
        {children}
        <div className="pl-1">{icon}</div>
      </>
    )}
  </button>
);

export default IconButton;
