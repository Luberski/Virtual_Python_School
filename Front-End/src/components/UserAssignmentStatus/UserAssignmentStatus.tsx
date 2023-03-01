import React from 'react';
import { AssignmentStatus } from '@app/constants';

type ClassroomDescriptorProps = {
  status: AssignmentStatus;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function ClassroomDescriptor({
  status,
  translations,
}: ClassroomDescriptorProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-1">
      {status === AssignmentStatus.COMPLETED ? (
        <div
          title={translations('Classrooms.assignment-reviewed-tooltip')}
          className="h-3 w-3 rounded-full bg-green-500"></div>
      ) : (
        <div className="h-3 w-3 rounded-full bg-neutral-400"></div>
      )}
      {status === AssignmentStatus.SUBMITTED ? (
        <div
          title={translations('Classrooms.assignment-submitted-tooltip')}
          className="h-3 w-3 rounded-full bg-yellow-500"></div>
      ) : (
        <div className="h-3 w-3 rounded-full bg-neutral-400"></div>
      )}
      {status === AssignmentStatus.NOT_STARTED ||
      status === AssignmentStatus.CORRECTABLE ? (
        <div
          title={translations('Classrooms.assignment-ongoing-tooltip')}
          className="h-3 w-3 rounded-full bg-red-500"></div>
      ) : (
        <div className="h-3 w-3 rounded-full bg-neutral-400"></div>
      )}
    </div>
  );
}
