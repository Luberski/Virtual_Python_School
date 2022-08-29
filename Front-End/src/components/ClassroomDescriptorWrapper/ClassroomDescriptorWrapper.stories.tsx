import type { ComponentMeta, ComponentStory } from '@storybook/react';
import type { Classroom } from '@app/models/Classroom';
import ClassroomDescriptorWrapper from './ClassroomDescriptorWrapper';

export default {
  title: 'ClassroomDescriptorWrapper',
  component: ClassroomDescriptorWrapper,
} as ComponentMeta<typeof ClassroomDescriptorWrapper>;

const classrooms: Classroom[] = [
  {
    id: 1,
    name: 'Kurs programowania w pythonie',
    teached_id: 1,
    num_of_students: 15,
  },
  {
    id: 2,
    name: 'Podstawy c++',
    teached_id: 2,
    num_of_students: 12,
  },
  {
    id: 3,
    name: 'Gra snake z wykorzystaniem biblioteki pygame',
    teached_id: 3,
    num_of_students: 22,
  },
];

export const Default: ComponentStory<typeof ClassroomDescriptorWrapper> = (
  args
) => <ClassroomDescriptorWrapper classroomArr={classrooms} {...args} />;
