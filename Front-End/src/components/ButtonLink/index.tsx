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
          ? "px-6 py-2 text-center text-white bg-indigo-500 shadow-md shadow-indigo-500/50 rounded-xl no-underline hover:no-underline"
          : `px-6 py-2 text-center text-gray-900 bg-white shadow-md shadow-gray-500/50 rounded-xl no-underline hover:no-underline`,
        className
      )}
    >
      {children}
    </a>
  );
});

export default ButtonLink;
