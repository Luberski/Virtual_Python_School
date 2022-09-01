import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { LightBulbIcon } from '@heroicons/react/20/solid';
import IconButton from '.';

export default {
  title: 'IconButton',
  component: IconButton,
} as ComponentMeta<typeof IconButton>;

export const Default: ComponentStory<typeof IconButton> = (args) => (
  <IconButton icon={LightBulbIcon} {...args} />
);
