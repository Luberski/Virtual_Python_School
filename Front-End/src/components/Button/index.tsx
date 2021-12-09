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
        ? "px-6 py-2 text-center text-white bg-indigo-500 shadow-md shadow-indigo-500/50 rounded-xl"
        : `px-6 py-2 text-center text-gray-900 bg-white shadow-md shadow-gray-500/50 rounded-xl`,
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
