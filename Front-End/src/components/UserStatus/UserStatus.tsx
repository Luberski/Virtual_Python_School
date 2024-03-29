import type React from 'react';
import type ClassroomUser from '@app/models/classroom/ClassroomUser';
import Button, { ButtonVariant } from '@app/components/Button';

type UserStatusProps = {
  user: ClassroomUser;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function UserStatus({
  user,
  onClick,
  disabled = false,
  translations,
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
          <div className="h-6 w-auto rounded-full bg-green-500 px-2 font-normal text-neutral-50">
            {translations('Classrooms.user-online')}
          </div>
        ) : (
          <div className="h-6 w-auto rounded-full bg-red-500 px-2 font-normal text-neutral-50">
            {translations('Classrooms.user-offline')}
          </div>
        )}
      </div>
    </Button>
  );
}
