import type { ComponentMeta, ComponentStory } from '@storybook/react';
import FancyToast from '.';

export default {
  title: 'FancyToast',
  component: FancyToast,
} as ComponentMeta<typeof FancyToast>;

const tObj = {
  id: '1',
  visible: true,
};

export const Default: ComponentStory<typeof FancyToast> = (args) => (
  <FancyToast message="Default message" toastObject={tObj} {...args} />
);
