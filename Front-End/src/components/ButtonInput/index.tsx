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
      primary ? "text-white bg-blue-500" : `text-black bg-white`,
      "px-6 py-2 text-center shadow-cool rounded-xl cursor-pointer",
      className
    )}
    type={type}
    value={value}
    {...props}
  />
);

export default ButtonInput;
