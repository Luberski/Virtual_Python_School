import React, { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

type SelectProps = {
  optionsList: {
    id: number;
    value: string;
    unavailable: boolean;
  }[];
};

export default function Select({ optionsList }: SelectProps) {
  const [selectedOption, setSelectedOption] = useState({
    value: 'Select option...',
  });

  return (
    <Listbox value={selectedOption} onChange={setSelectedOption}>
      <Listbox.Button
        className={({ open }) =>
          `brand-shadow flex h-10 w-full cursor-pointer items-center px-6 justify-between border-none text-left shadow-black/25 ${
            open
              ? 'rounded-t-lg bg-indigo-50 text-indigo-900'
              : 'bg-neutral-50 rounded-lg'
          }`
        }>
        {selectedOption.value}
        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </Listbox.Button>
      <Listbox.Options
        className={
          'brand-shadow flex w-full cursor-pointer flex-col rounded-b-lg border-none bg-indigo-50 text-left shadow-black/25'
        }>
        {optionsList.map((option) => (
          <Listbox.Option
            key={option.id}
            className={({ active }) =>
              `relative cursor-default select-none py-2 px-6 ${
                active ? 'text-indigo-900 font-medium bg-indigo-200' : ''
              }`
            }
            value={option}
            disabled={option.unavailable}>
            {option.value}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  );
}
