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
    teacher_name: 'Jan',
    teacher_last_name: 'Kowalski',
    num_of_students: 15,
    is_public: true,
    access_code: '1234',
  },
  {
    id: 2,
    name: 'Podstawy c++',
    teacher_id: 2,
    teacher_name: 'Adam',
    teacher_last_name: 'Nowak',
    num_of_students: 12,
    is_public: true,
    access_code: '231213',
  },
  {
    id: 3,
    name: 'Gra snake z wykorzystaniem biblioteki pygame',
    teacher_id: 3,
    teacher_name: 'Franek',
    teacher_last_name: 'Zalewski',
    num_of_students: 22,
    is_public: true,
    access_code: '21312334',
  },
];

export const Default: ComponentStory<typeof ClassroomDescriptorWrapper> = (
  args
) => <ClassroomDescriptorWrapper classroomArr={classrooms} {...args} />;
