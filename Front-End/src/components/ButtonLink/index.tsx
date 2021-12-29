import React, { forwardRef } from "react";
import clsx from "clsx";

type ButtonLinkProps = {};

const ButtonLink = forwardRef(function ButtonLink(
  {
    href,
    children,
    className,
  }: ButtonLinkProps & React.HTMLProps<HTMLAnchorElement>,
  _ref
) {
  return (
    <a href={href} className={clsx("btn", "hover:no-underline", className)}>
      {children}
    </a>
  );
});

export default ButtonLink;
