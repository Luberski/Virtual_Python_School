import type { ComponentMeta, ComponentStory } from '@storybook/react';
import ClassroomDescriptor from '.';
import type Classroom from '@app/models/Classroom';

export default {
  title: 'ClassroomDescriptor',
  component: ClassroomDescriptor,
} as ComponentMeta<typeof ClassroomDescriptor>;

const class1: Classroom = {
  id: 21,
  name: 'Nauka programowania',
  teacher_id: 2384,
  num_of_students: 12,
  is_public: true,
};

export const Default: ComponentStory<typeof ClassroomDescriptor> = (args) => (
  <ClassroomDescriptor classroom={class1} {...args} />
);
