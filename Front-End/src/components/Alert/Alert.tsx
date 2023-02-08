import clsx from 'clsx';

type AlertProps = {
  className?: string;
  children: React.ReactNode;
};

export default function Alert({ children, className, ...props }: AlertProps) {
  return (
    <div
      className={clsx(
        'brand-shadow flex w-fit items-center justify-center rounded-lg bg-sky-50 p-4 font-medium text-sky-900 shadow-sky-900/25 sm:p-6',
        className
      )}
      {...props}>
      {children}
    </div>
  );
}
