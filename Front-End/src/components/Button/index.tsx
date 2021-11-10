import clsx from "clsx";

type ButtonProps = {
  children?: React.ReactNode;
  className?: string;
  primary?: boolean;
};

const Button = ({ children, primary = false, className }: ButtonProps) => (
  <button
    className={clsx(
      primary
        ? "px-6 py-2 text-center text-white bg-blue-500 shadow-cool rounded-xl"
        : `px-6 py-2 text-center text-black bg-white shadow-cool rounded-xl`,
      className
    )}
  >
    {children}
  </button>
);

export default Button;
