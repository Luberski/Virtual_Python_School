import React from 'react';
import Button, { ButtonVariant } from '@app/components/Button';
import UserAssignmentStatus from '@app/components/UserAssignmentStatus';
import type ClassroomUserAssignment from '@app/models/classroom/ClassroomUserAssignment';

type UserAssignmentButtonProps = {
  userAssignment: ClassroomUserAssignment;
  switchToAssignmentView: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
};

export default function UserAssignmentButton({
  switchToAssignmentView,
  userAssignment,
}: UserAssignmentButtonProps) {
  return (
    <Button
      variant={ButtonVariant.PRIMARY}
      type="button"
      onClick={switchToAssignmentView}>
      <div className="flex flex-row items-center justify-between gap-x-2">
        <div>{userAssignment.userId}</div>
        <UserAssignmentStatus
          status={userAssignment.status}></UserAssignmentStatus>
      </div>
    </Button>
  );
}
