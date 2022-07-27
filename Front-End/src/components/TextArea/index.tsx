import type React from 'react';
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
    {...(register(label, { required }) as {
      (...unknown);
    })}
    className={clsx(
      'w-72 rounded-lg border border-neutral-300 bg-neutral-100 p-3 dark:border-neutral-600 dark:bg-neutral-700 sm:w-96',
      className
    )}
    {...rest}
  />
);

export default TextArea;
