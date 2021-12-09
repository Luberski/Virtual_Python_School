import React, { forwardRef } from "react";
import clsx from "clsx";

type ButtonLinkProps = {
  primary?: boolean;
};

const ButtonLink = forwardRef(function ButtonLink(
  {
    href,
    children,
    primary = false,
    className,
  }: ButtonLinkProps & React.HTMLProps<HTMLAnchorElement>,
  _ref
) {
  return (
    <a
      href={href}
      className={clsx(
        primary
          ? "px-6 py-2 text-center text-white bg-blue-500 shadow-cool rounded-xl no-underline hover:no-underline"
          : `px-6 py-2 text-center text-black bg-white shadow-cool rounded-xl no-underline hover:no-underline`,
        className
      )}
    >
      {children}
    </a>
  );
});

export default ButtonLink;
