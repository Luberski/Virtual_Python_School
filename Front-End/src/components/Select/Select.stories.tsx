import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { useState } from 'react';
import Select from '.';

export default {
  title: 'Select',
  component: Select,
} as ComponentMeta<typeof Select>;

const people = [
  'Wade Cooper Wade Coope Wade Cooper',
  'Arlene Mccoy',
  'Devon Webb',
  'Tom Cook',
  'Tanya Fox',
  'Hellen Schmidt',
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
