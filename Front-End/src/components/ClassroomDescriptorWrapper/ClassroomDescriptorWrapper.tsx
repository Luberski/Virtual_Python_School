import React from 'react';
import type Classroom from '@app/models/Classroom';
import ClassroomDescriptor from '../ClassroomDescriptor';

type ClassroomDescriptorWrapperProps = {
  classroomArr: Classroom[];
};

export default function ClassroomDescriptorWrapper({
  classroomArr,
}: ClassroomDescriptorWrapperProps) {
  return (
    <div className="mx-32 flex flex-col rounded-lg border-2 bg-neutral-50 dark:bg-neutral-800">
      <div className="flex flex-row items-center justify-between border-b-2 px-6 py-2 font-medium">
        <span className="w-1/4">Classroom name</span>
        <span className="w-1/4">Teacher</span>
        <span className="w-1/4">Number of students</span>
        <div className="w-36">&nbsp;</div>
      </div>
      <div className="px-6">
        <ul>
          {classroomArr.map((classroom) => (
            <li key={classroom.id}>
              <ClassroomDescriptor classroom={classroom} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
