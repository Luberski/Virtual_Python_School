import React from 'react';
import ClassroomDescriptor from '../ClassroomDescriptor';
import type Classroom from '@app/models/Classroom';

type ClassroomDescriptorWrapperProps = {
  classroomArr: Classroom[];
  translations: (key: string) => string;
};

export default function ClassroomDescriptorWrapper({
  classroomArr,
  translations,
}: ClassroomDescriptorWrapperProps) {
  return (
    <div className="mx-32 flex flex-col rounded-lg border-2 bg-neutral-50 dark:bg-neutral-800">
      <div className="flex flex-row items-center justify-between border-b-2 px-6 py-2 font-medium">
        <span className="w-1/4">
          {translations('Classrooms.classroom-name')}
        </span>
        <span className="w-1/4">{translations('Classrooms.teacher-name')}</span>
        <span className="w-1/4"></span>
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
