import type { ComponentMeta, ComponentStory } from '@storybook/react';
import type Classroom from '@app/models/Classroom';
import ClassroomDescriptorWrapper from '.';

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
    is_public: true,
  },
  {
    id: 2,
    name: 'Podstawy c++',
    teacher_id: 2,
    num_of_students: 12,
    is_public: true,
  },
  {
    id: 3,
    name: 'Gra snake z wykorzystaniem biblioteki pygame',
    teacher_id: 3,
    num_of_students: 22,
    is_public: true,
  },
];

export const Default: ComponentStory<typeof ClassroomDescriptorWrapper> = (
  args
) => <ClassroomDescriptorWrapper classroomArr={classrooms} {...args} />;
