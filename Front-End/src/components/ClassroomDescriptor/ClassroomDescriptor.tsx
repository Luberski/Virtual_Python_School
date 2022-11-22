import React from 'react';
import Link from 'next/link';
import Button, { ButtonVariant } from '@app/components/Button';
import type Classroom from '@app/models/Classroom';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { joinClassroom } from '@app/features/classrooms/classroomsSlice';

type ClassroomDescriptorProps = {
  classroom: Classroom;
};

export default function ClassroomDescriptor({
  classroom,
}: ClassroomDescriptorProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClassroomJoin = (classroomId: number) => async () => {
    try {
      await dispatch(joinClassroom(classroomId));
      router.push(`/courses/${classroomId}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-16 flex-row items-center justify-between whitespace-nowrap">
      <span className="w-1/4 truncate">{classroom.name}</span>
      <span className="w-1/4">{classroom.teacher_id}</span>
      <span className="w-1/4">{classroom.num_of_students}</span>
      <div className="w-36">
        <Button
          variant={ButtonVariant.PRIMARY}
          type="button"
          onClick={handleClassroomJoin(classroom.id)}>
          Join classroom
        </Button>
      </div>
    </div>
  );
}
