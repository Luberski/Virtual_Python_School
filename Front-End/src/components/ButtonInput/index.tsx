import clsx from 'clsx';
import React from 'react';
import { ButtonSize, ButtonVariant, ButtonProps } from '../Button';

export const ButtonInputVariant = ButtonVariant;
export const ButtonInputSize = ButtonSize;

type ButtonInputProps = ButtonProps;

const ButtonInput = ({
  className,
  variant = ButtonInputVariant.SECONDARY,
  sizeType = ButtonInputSize.DEFAULT,
  ...props
}: ButtonInputProps & React.HTMLProps<HTMLInputElement>) => (
  <input className={clsx('btn', variant, sizeType, className)} {...props} />
);

export default ButtonInput;
