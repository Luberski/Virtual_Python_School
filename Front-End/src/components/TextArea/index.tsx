import React from 'react';
import clsx from 'clsx';
type TextAreaProps = {
  label: string;
  register: (label: string, options?: unknown) => unknown;
  required?: boolean;
  className?: string;
};

const TextArea = ({
  label,
  register,
  required,
  className,
  ...rest
}: TextAreaProps & React.HTMLProps<HTMLTextAreaElement>) => (
  <textarea
    {...register(label, { required })}
    className={clsx(
      'p-3 w-72 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 sm:w-96',
      className
    )}
    {...rest}
  />
);

export default TextArea;
