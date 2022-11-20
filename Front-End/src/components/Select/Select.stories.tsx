import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';
import Select from '.';

export default {
  title: 'Select',
  component: Select,
} as ComponentMeta<typeof Select>;

const people = [
  {
    id: 1,
    value: 'Wade Cooper Wade Coope Wade Cooper',
    label: 'Wade Cooper Wade Coope Wade Cooper',
    disabled: false,
  },
  {
    id: 2,
    value: 'Arlene Mccoy',
    label: 'Arlene Mccoy',
    disabled: false,
  },
  {
    id: 3,
    value: 'Tom Cook',
    label: 'Tom Cook',
    disabled: false,
  },
  {
    id: 4,
    value: 'Tanya Fox',
    label: 'Tanya Fox',
    disabled: false,
  },
  {
    id: 5,
    value: 'Hellen Schmidt',
    label: 'Hellen Schmidt',
    disabled: false,
  },
];

export const Default: ComponentStory<typeof Select> = (args) => {
  const [selected, setSelected] = useState(people[0]);

  return (
    <Select
      options={people}
      selected={selected}
      setSelected={setSelected}
      {...args}
    />
  );
};
