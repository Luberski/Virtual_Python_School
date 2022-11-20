import clsx from 'clsx';

type CheckboxProps = {
  label: string;
  register?: (label: string, options?: unknown) => unknown;
  required?: boolean;
  className?: string;
  name: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Checkbox({
  label,
  name,
  register,
  required,
  className,
  disabled,
  checked,
  onChange,
}: CheckboxProps & React.HTMLProps<HTMLInputElement>) {
  return (
    <input
      name={name}
      checked={checked}
      type="checkbox"
      disabled={disabled}
      onChange={onChange}
      {...(register &&
        (register(label, { required }) as {
          (...unknown);
        }))}
      className={clsx('checkbox', className)}
    />
  );
}
