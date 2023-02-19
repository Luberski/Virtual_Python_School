import React from 'react';
import { AssignmentStatus } from '@app/constants';

type ClassroomDescriptorProps = {
  status: AssignmentStatus;
};

export default function ClassroomDescriptor({
  status,
}: ClassroomDescriptorProps) {
  return (
    <div className="flex flex-row justify-between align-middle">
      {status === AssignmentStatus.COMPLETED ? (
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
      ) : (
        <div className="h-2 w-2 rounded-full bg-neutral-50"></div>
      )}
      {status === AssignmentStatus.SUBMITTED ? (
        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
      ) : (
        <div className="h-2 w-2 rounded-full bg-neutral-50"></div>
      )}
      {status === AssignmentStatus.IN_PROGRESS ? (
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
      ) : (
        <div className="h-2 w-2 rounded-full bg-neutral-50"></div>
      )}
    </div>
  );
}
