import type { ComponentMeta, ComponentStory } from '@storybook/react';
import type { Classroom } from '@app/models/Classroom';
import ClassroomDescriptor from '.';

export default {
  title: 'ClassroomDescriptor',
  component: ClassroomDescriptor,
} as ComponentMeta<typeof ClassroomDescriptor>;

const class1: Classroom = {
  id: 21,
  name: 'Nauka programowania',
  teached_id: 2384,
  num_of_students: 12,
};

export const Default: ComponentStory<typeof ClassroomDescriptor> = (args) => (
  <ClassroomDescriptor classroom={class1} {...args} />
);
