import type { ComponentMeta, ComponentStory } from '@storybook/react';
import ClassroomDescriptorWrapper from './ClassroomDescriptorWrapper';
import type { Classroom } from '@app/models/Classroom';

export default {
  title: 'ClassroomDescriptorWrapper',
  component: ClassroomDescriptorWrapper,
} as ComponentMeta<typeof ClassroomDescriptorWrapper>;

const classrooms: Classroom[] = [
  {
    id: 1,
    name: 'Kurs programowania w pythonie',
    teacher_id: 1,
    num_of_students: 15,
    isPublic: true,
  },
  {
    id: 2,
    name: 'Podstawy c++',
    teacher_id: 2,
    num_of_students: 12,
    isPublic: true,
  },
  {
    id: 3,
    name: 'Gra snake z wykorzystaniem biblioteki pygame',
    teacher_id: 3,
    num_of_students: 22,
    isPublic: true,
  },
];

export const Default: ComponentStory<typeof ClassroomDescriptorWrapper> = (
  args
) => <ClassroomDescriptorWrapper classroomArr={classrooms} {...args} />;
