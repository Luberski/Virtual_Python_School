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
    {...(register && {
      ...(register(label, { required }) as { (...unknown) }),
    })}
    className={clsx(
      'min-w-72 sm:min-w-96 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 placeholder:text-neutral-400 dark:border-neutral-600 dark:bg-neutral-700',
      className
    )}
    {...rest}
  />
);
export default TextArea;
