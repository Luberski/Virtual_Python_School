import { Switch as HeadlessSwitch } from '@headlessui/react';

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
      className={`${
        checked ? 'bg-indigo-50' : 'bg-neutral-50'
      } relative inline-flex h-10 w-16 items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50`}>
      <span className="sr-only">{label}</span>
      <span
        className={`${
          checked
            ? 'translate-x-9 bg-indigo-900'
            : 'translate-x-2 bg-neutral-300'
        } inline-block h-5 w-5 rounded-lg`}
      />
    </HeadlessSwitch>
  );
}
