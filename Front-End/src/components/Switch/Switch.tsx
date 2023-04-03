import { Switch as HeadlessSwitch } from '@headlessui/react';
import clsx from 'clsx';

type SwitchProps = {
  checked: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  label?: string;
  onChange: (checked: boolean) => void;
};

export default function Switch({
  checked,
  disabled,
  onChange,
  name,
  value,
  label,
}: SwitchProps) {
  return (
    <HeadlessSwitch
      checked={checked}
      disabled={disabled}
      name={name}
      onChange={onChange}
      value={value}
      className={clsx(
        checked
          ? 'bg-sky-50 shadow-sky-900/25'
          : 'bg-neutral-50 shadow-black/25',
        'brand-shadow relative inline-flex h-10 w-16 items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50'
      )}>
      <span className="sr-only">{label}</span>
      <span
        className={clsx(
          checked ? 'translate-x-9 bg-sky-900' : 'translate-x-2 bg-neutral-300',
          'inline-block h-5 w-5 rounded-lg'
        )}
      />
    </HeadlessSwitch>
  );
}
