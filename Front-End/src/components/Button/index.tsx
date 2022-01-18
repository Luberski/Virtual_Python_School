import React from "react";
import clsx from "clsx";

type ButtonProps = {};

const Button = ({
  children,
  className,
  onClick,
}: ButtonProps & React.HTMLProps<HTMLButtonElement>) => (
  <button className={clsx("btn", className)} onClick={onClick}>
    {children}
  </button>
);

export default Button;
