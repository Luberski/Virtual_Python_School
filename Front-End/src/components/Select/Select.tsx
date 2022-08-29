import React, { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

type SelectProps = {
  options: {
    id: number;
    value: string;
    disabled: boolean;
  }[];
  placeholder?: string;
};

export default function Select({
  options,
  placeholder = 'Select option...',
}: SelectProps) {
  const [selectedOption, setSelectedOption] = useState({
    value: placeholder,
  });

  return (
    <Listbox value={selectedOption} onChange={setSelectedOption}>
      <div className="relative mt-1 w-full">
        <Listbox.Button
          className={({ open }) =>
            `brand-shadow flex w-full py-3 cursor-pointer items-center px-4 justify-between border-none text-left shadow-black/25 ${
              open
                ? 'rounded-t-lg bg-indigo-50 text-indigo-900'
                : 'bg-neutral-50 rounded-lg dark:text-neutral-400 dark:bg-neutral-700'
            }`
          }>
          {selectedOption.value}
          <ChevronDownIcon
            className="h-5 w-5 text-neutral-400"
            aria-hidden="true"
          />
        </Listbox.Button>

        <Listbox.Options
          className={
            'brand-shadow flex w-full cursor-pointer flex-col rounded-b-lg border-none bg-indigo-50 text-left shadow-black/25'
          }>
          {options.map((option) => (
            <Listbox.Option
              key={option.id}
              className={({ active }) =>
                clsx(
                  'relative select-none rounded-b-lg py-2 px-4 dark:text-neutral-900',
                  active && 'bg-indigo-200 font-medium text-indigo-900'
                )
              }
              value={option}
              disabled={option.disabled}>
              {option.value}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}
