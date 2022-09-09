import type { ComponentMeta, ComponentStory } from '@storybook/react';
import DynamicCourseCard from '.';

export default {
  title: 'DynamicCourseCard',
  component: DynamicCourseCard,
} as ComponentMeta<typeof DynamicCourseCard>;

export const Default: ComponentStory<typeof DynamicCourseCard> = () => (
  <DynamicCourseCard>Try dynamic course</DynamicCourseCard>
);
