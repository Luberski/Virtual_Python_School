import type { ComponentMeta, ComponentStory } from '@storybook/react';
import Checkbox from '.';

export default {
  title: 'Checkbox',
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

export const Default: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} />
);

export const Checked: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} checked={true} />
);

export const Disabled: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} disabled={true} />
);

export const CheckedDisabled: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} checked={true} disabled={true} />
);
