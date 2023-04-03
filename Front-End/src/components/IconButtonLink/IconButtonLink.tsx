import type React from 'react';
import { forwardRef } from 'react';
import clsx from 'clsx';
import type { IconButtonProps } from '@app/components/IconButton';
import { IconButtonSize, IconButtonVariant } from '@app/components/IconButton';

export const IconButtonLinkVariant = IconButtonVariant;
export const IconButtonLinkSize = IconButtonSize;

type IconButtonLinkProps = IconButtonProps;

const IconButtonLink = forwardRef(function ButtonLink(
  {
    children,
    className,
    variant = IconButtonLinkVariant.SECONDARY,
    sizeType = IconButtonLinkSize.DEFAULT,
    icon,
    ...props
  }: IconButtonLinkProps & React.HTMLProps<HTMLAnchorElement>,
  _ref
) {
  return (
    <a
      {...props}
      className={clsx(
        'btn',
        'hover:no-underline',
        'flex w-fit items-center',
        variant,
        sizeType,
        className
      )}>
      <div className="pr-1">{icon}</div>
      {children}
    </a>
  );
});

export default IconButtonLink;
