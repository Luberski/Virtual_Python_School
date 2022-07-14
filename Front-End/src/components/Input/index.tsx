import React from 'react';
import clsx from 'clsx';

type InputProps = {
  label: string;
  register: (label: string, options?: unknown) => unknown;
  required?: boolean;
  className?: string;
};

const Input = ({
  label,
  register,
  required,
  className,
  ...rest
}: InputProps & React.HTMLProps<HTMLInputElement>) => (
  <input
    {...(register(label, { required }) as {
      (...unknown);
    })}
    className={clsx(
      'w-72 rounded-lg border border-gray-300 bg-gray-100 p-3 dark:border-gray-600 dark:bg-gray-700 sm:w-96',
      className
    )}
    {...rest}
  />
);
export default Input;
