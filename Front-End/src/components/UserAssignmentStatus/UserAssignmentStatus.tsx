import React from 'react';
import { AssignmentStatus } from '@app/constants';

type ClassroomDescriptorProps = {
  status: AssignmentStatus;
};

export default function ClassroomDescriptor({
  status,
}: ClassroomDescriptorProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-1">
      {status === AssignmentStatus.COMPLETED ? (
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
      ) : (
        <div className="h-3 w-3 rounded-full bg-neutral-400"></div>
      )}
      {status === AssignmentStatus.SUBMITTED ? (
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
      ) : (
        <div className="h-3 w-3 rounded-full bg-neutral-400"></div>
      )}
      {status === AssignmentStatus.NOT_STARTED ? (
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
      ) : (
        <div className="h-3 w-3 rounded-full bg-neutral-400"></div>
      )}
    </div>
  );
}
