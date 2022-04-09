import React, { forwardRef } from 'react';
import clsx from 'clsx';

export enum ButtonLinkVariant {
  PRIMARY = 'btn-primary',
  SECONDARY = 'btn-secondary',
  OUTLINE = 'btn-outline',
  OUTLINE_PRIMARY = 'btn-outline-primary',
  DANGER = 'btn-danger',
  SUCCESS = 'btn-success',
}

export enum ButtonLinkSize {
  DEFAULT = '',
  NORMAL = 'w-24',
  MEDIUM = 'w-32',
  LARGE = 'w-40',
  EXTRA_LARGE = 'w-48',
}

type ButtonLinkProps = {
  variant?: ButtonLinkVariant;
  disabled?: boolean;
  sizeType?: ButtonLinkSize;
  href?: string;
  className?: string;
};

const ButtonLink = forwardRef(function ButtonLink(
  {
    href,
    children,
    className,
    variant = ButtonLinkVariant.SECONDARY,
    sizeType = ButtonLinkSize.DEFAULT,
  }: ButtonLinkProps & React.HTMLProps<HTMLAnchorElement>,
  _ref
) {
  return (
    <a
      href={href}
      className={clsx(
        'btn',
        variant,
        sizeType,
        'hover:no-underline',
        className
      )}>
      {children}
    </a>
  );
});

export default ButtonLink;
