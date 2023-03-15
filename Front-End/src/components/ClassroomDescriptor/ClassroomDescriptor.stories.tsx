import type { ComponentMeta, ComponentStory } from '@storybook/react';
import type Classroom from '@app/models/Classroom';
import ClassroomDescriptor from '.';

export default {
  title: 'ClassroomDescriptor',
  component: ClassroomDescriptor,
} as ComponentMeta<typeof ClassroomDescriptor>;

const class1: Classroom = {
  id: 21,
  name: 'Nauka programowania',
  teacher_id: 2384,
  teacher_name: 'Jan',
  teacher_last_name: 'Kowalski',
  num_of_students: 12,
  is_public: true,
  access_code: '1234',
};

export const Default: ComponentStory<typeof ClassroomDescriptor> = (args) => (
  <ClassroomDescriptor classroom={class1} {...args} />
);
