import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { ThemeButton } from '.';

export default {
  title: 'ThemeButton',
  component: ThemeButton,
} as ComponentMeta<typeof ThemeButton>;

export const Default: ComponentStory<typeof ThemeButton> = () => (
  <ThemeButton />
);
