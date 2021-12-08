import clsx from "clsx";

type ButtonProps = {
  primary?: boolean;
};

const Button = (
  {
    children,
    primary = false,
    className,
    onClick,
  }: ButtonProps & React.HTMLProps<HTMLButtonElement>,
  {}
) => (
  <button
    className={clsx(
      primary
        ? "px-6 py-2 text-center text-white bg-blue-500 shadow-cool rounded-xl"
        : `px-6 py-2 text-center text-black bg-white shadow-cool rounded-xl`,
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
