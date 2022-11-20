import type { ComponentMeta, ComponentStory } from '@storybook/react';
import Footer from '.';

export default {
  title: 'Footer',
  component: Footer,
} as ComponentMeta<typeof Footer>;

export const Default: ComponentStory<typeof Footer> = (args) => (
  <Footer/>
);
