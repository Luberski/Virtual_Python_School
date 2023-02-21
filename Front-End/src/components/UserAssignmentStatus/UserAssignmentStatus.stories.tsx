import type { ComponentMeta, ComponentStory } from '@storybook/react';
import UserAssignmentStatus from '.';
import { AssignmentStatus } from '@app/constants';

export default {
  title: 'UserAssignmentStatus',
  component: UserAssignmentStatus,
} as ComponentMeta<typeof UserAssignmentStatus>;

export const Default: ComponentStory<typeof UserAssignmentStatus> = (args) => (
  <UserAssignmentStatus status={AssignmentStatus.NOT_STARTED} {...args} />
);

export const InProgress: ComponentStory<typeof UserAssignmentStatus> = (
  args
) => <UserAssignmentStatus status={AssignmentStatus.IN_PROGRESS} {...args} />;

export const Submitted: ComponentStory<typeof UserAssignmentStatus> = (
  args
) => <UserAssignmentStatus status={AssignmentStatus.SUBMITTED} {...args} />;

export const Completed: ComponentStory<typeof UserAssignmentStatus> = (
  args
) => <UserAssignmentStatus status={AssignmentStatus.COMPLETED} {...args} />;