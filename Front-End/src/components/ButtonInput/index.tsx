import clsx from "clsx";

type ButtonInputProps = {
  className?: string;
  primary?: boolean;
  value?: string;
  type?: string;
};

const ButtonInput = ({
  primary = false,
  className,
  value,
  type,
  ...props
}: ButtonInputProps) => (
  <input
    className={clsx(
      primary
        ? "text-white bg-indigo-500 shadow-indigo-500/50"
        : `text-gray-900 bg-white shadow-gray-500/50`,
      "px-6 py-2 text-center shadow-md rounded-xl cursor-pointer",
      className
    )}
    type={type}
    value={value}
    {...props}
  />
);

export default ButtonInput;
