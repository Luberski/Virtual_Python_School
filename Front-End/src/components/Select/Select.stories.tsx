import type { ComponentMeta, ComponentStory } from '@storybook/react';
import Select from '.';

export default {
  title: 'Select',
  component: Select,
} as ComponentMeta<typeof Select>;

export const Default: ComponentStory<typeof Select> = (args) => (
  <Select
    optionsList={[
      {
        id: 1,
        value: 'Opt1',
        unavailable: false,
      },
      {
        id: 1,
        value: 'Opt2',
        unavailable: false,
      },
    ]}></Select>
);
