import clsx from 'clsx';

export default function Alert({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'brand-shadow flex w-fit items-center justify-center rounded-lg bg-indigo-50 p-4 font-medium text-indigo-900 shadow-indigo-900/25 sm:p-6',
        className
      )}
      {...props}>
      {children}
    </div>
  );
}
