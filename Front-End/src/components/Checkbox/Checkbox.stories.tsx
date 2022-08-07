import type { ComponentMeta, ComponentStory } from '@storybook/react';
import Checkbox from '.';

export default {
  title: 'Checkbox',
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

export const Default: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args}>Checkbox</Checkbox>
);

export const Checked: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} checked={true}>
    Checkbox
  </Checkbox>
);

export const Disabled: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} disabled>
    Checkbox
  </Checkbox>
);

export const CheckedDisabled: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} checked={true} disabled={true}>
    Checkbox
  </Checkbox>
);
