import React from 'react';
import Link from 'next/link';
import ButtonLink, { ButtonLinkVariant } from '@app/components/ButtonLink';
import type { Classroom } from '@app/models/Classroom';

type ClassroomDescriptorProps = {
  classroom: Classroom;
};

export default function ClassroomDescriptor({
  classroom,
}: ClassroomDescriptorProps) {
  return (
    <div className="flex h-16 flex-row items-center justify-between whitespace-nowrap">
      <span className="w-1/4 truncate">{classroom.name}</span>
      <span className="w-1/4">{classroom.teacher_id}</span>
      <span className="w-1/4">{classroom.num_of_students}</span>
      <div className="w-36">
        <Link href={`/classrooms/${classroom.id}`}>
          <ButtonLink variant={ButtonLinkVariant.PRIMARY}>
            Join classroom
          </ButtonLink>
        </Link>
      </div>
    </div>
  );
}
