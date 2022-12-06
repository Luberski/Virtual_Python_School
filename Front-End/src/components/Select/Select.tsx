import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Fragment } from 'react';

export type Option = {
  id: string | number;
  value: string;
  label: string;
  disabled: boolean;
};

type SelectProps = {
  options: Option[];
  selected: Option;
  setSelected: (option: Option) => void;
  disabled?: boolean;
  className?: string;
  dataTestId?: string;
};

export default function Select({
  options,
  selected,
  setSelected,
  disabled,
  className,
  dataTestId = 'select-button',
}: SelectProps) {
  return (
    <Listbox value={selected} onChange={setSelected} disabled={disabled}>
      <div className="relative mt-1 w-full">
        <Listbox.Button
          data-testid={dataTestId}
          // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
          className={clsx(
            'relative w-72 cursor-pointer rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-4 pr-10 text-left text-neutral-900 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white sm:w-96 sm:text-sm',
            className
          )}>
          <span className="block truncate py-2">{selected.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-neutral-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <Listbox.Options
            // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
            className="brand-shadow absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-lg bg-neutral-50 py-1 text-base shadow-neutral-900 ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-700 sm:text-sm">
            {options.map((item, key) => (
              <Listbox.Option
                key={item.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-neutral-900 dark:text-neutral-400'
                  }`
                }
                value={item}
                disabled={item.disabled}>
                {({ selected }) => (
                  <>
                    <span
                      data-testid={`select-option-${key}`}
                      className={`block truncate ${
                        selected ? 'font-bold' : 'font-normal'
                      }`}>
                      {item.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-900 dark:text-indigo-300">
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
