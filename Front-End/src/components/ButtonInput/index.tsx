import clsx from "clsx";

type ButtonInputProps = {
  className?: string;
  value?: string;
  type?: string;
};

const ButtonInput = ({
  className,
  value,
  type,
  ...props
}: ButtonInputProps) => (
  <input
    className={clsx(
      "btn",
      className
    )}
    type={type}
    value={value}
    {...props}
  />
);

export default ButtonInput;
