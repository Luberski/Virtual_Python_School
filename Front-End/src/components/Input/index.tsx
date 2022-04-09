import React from 'react';

type InputProps = {
  label: string;
  register: (label: string, options?: unknown) => unknown;
  required?: boolean;
};

const Input = ({
  label,
  register,
  required,
  ...rest
}: InputProps & React.HTMLProps<HTMLInputElement>) => (
  <input
    {...register(label, { required })}
    className="p-3 w-96 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
    {...rest}
  />
);
export default Input;
