import clsx from "clsx";

type ButtonLinkProps = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  primary?: boolean;
};

const ButtonLink = ({
  href,
  children,
  primary = false,
  className,
}: ButtonLinkProps) => (
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

export default ButtonLink;
