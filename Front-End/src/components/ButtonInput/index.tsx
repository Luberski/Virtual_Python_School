import clsx from 'clsx';
import React from 'react';

export enum ButtonInputVariant {
  PRIMARY = 'btn-primary',
  SECONDARY = 'btn-secondary',
  OUTLINE = 'btn-outline',
  OUTLINE_PRIMARY = 'btn-outline-primary',
  DANGER = 'btn-danger',
  SUCCESS = 'btn-success',
}

export enum ButtonInputSize {
  DEFAULT = '',
  NORMAL = 'w-24',
  MEDIUM = 'w-32',
  LARGE = 'w-40',
  EXTRA_LARGE = 'w-48',
}

type ButtonInputProps = {
  variant?: ButtonInputVariant;
  sizeType?: ButtonInputSize;
  className?: string;
};

const ButtonInput = ({
  className,
  variant = ButtonInputVariant.SECONDARY,
  sizeType = ButtonInputSize.DEFAULT,
  ...props
}: ButtonInputProps & React.HTMLProps<HTMLInputElement>) => (
  <input className={clsx('btn', variant, sizeType, className)} {...props} />
);

export default ButtonInput;
