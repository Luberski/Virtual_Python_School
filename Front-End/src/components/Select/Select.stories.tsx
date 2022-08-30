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
  },
  {
    id: 2,
    value: 'Arlene Mccoy',
  },
  {
    id: 3,
    value: 'Tom Cook',
  },
  {
    id: 4,
    value: 'Tanya Fox',
  },
  {
    id: 5,
    value: 'Hellen Schmidt',
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
