import type React from 'react';
import type ClassroomUser from '@app/models/classroom/ClassroomUser';
import Button, { ButtonVariant } from '@app/components/Button';

type UserStatusProps = {
  user: ClassroomUser;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
};

export default function UserStatus({
  user,
  onClick,
  disabled = false,
}: UserStatusProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      type="button"
      variant={ButtonVariant.PRIMARY}>
      <div className="flex flex-row items-center justify-between gap-x-2">
        <div>{user?.userId}</div>
        {user.online ? (
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        ) : (
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
        )}
      </div>
    </Button>
  );
}
