import type React from 'react';
import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ButtonProps} from '../Button';
import { ButtonSize, ButtonVariant } from '../Button';

export const ButtonLinkVariant = ButtonVariant;
export const ButtonLinkSize = ButtonSize;

type ButtonLinkProps = ButtonProps;

const ButtonLink = forwardRef(function ButtonLink(
  {
    children,
    className,
    variant = ButtonLinkVariant.SECONDARY,
    sizeType = ButtonLinkSize.DEFAULT,
    ...props
  }: ButtonLinkProps & React.HTMLProps<HTMLAnchorElement>,
  _ref
) {
  return (
    <a
      {...props}
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
