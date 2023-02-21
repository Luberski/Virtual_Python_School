import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { AssignmentStatus, WhiteboardType } from '@app/constants';
import type ClassroomUserAssignment from '@app/models/classroom/ClassroomUserAssignment';
import UserAssignmentButton from '.';

export default {
  title: 'UserAssignmentButton',
  component: UserAssignmentButton,
} as ComponentMeta<typeof UserAssignmentButton>;

const userAssignmentObj: ClassroomUserAssignment = {
  userId: 'pb12343',
  assignment: {
    id: '1234',
    title: 'Assignment 1',
    description: 'This is the first assignment',
    initialCode: 'print("Hello World")',
  },
  whiteboard: {
    code: 'print("Hello World")',
    whiteboardType: WhiteboardType.ASSIGNMENT,
  },
  status: AssignmentStatus.NOT_STARTED,
  grade: null,
  feedback: null,
};

export const Default: ComponentStory<typeof UserAssignmentButton> = (args) => (
  <UserAssignmentButton
    userAssignment={userAssignmentObj}
    switchToAssignmentView={() => {
      return 0;
    }}
    {...args}
  />
);
