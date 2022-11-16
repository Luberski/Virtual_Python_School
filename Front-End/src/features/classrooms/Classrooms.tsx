import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { CheckBadgeIcon, CheckCircleIcon } from '@heroicons/react/20/solid';
import FancyCard from '@app/components/FancyCard';
import FancyToast from '@app/components/FancyToast';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import ClassroomDescriptorWrapper from '@app/components/ClassroomDescriptorWrapper';
import type { Classroom } from '@app/models/Classroom';
import { joinClassroom } from '@app/features/classrooms/joinClassroomSlice';

type ClassroomsProps = {
  classrooms: Classroom[];
  translations: (key: string) => string;
};

export default function Classrooms({
  classrooms,
  translations,
}: ClassroomsProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleClassroomJoin = (classroomId: number) => async () => {
    await dispatch(joinClassroom(classroomId));
    notify();
    // wait 1 second to show the toast
    setTimeout(() => {
      toast.remove('classroom-joined-notification');
      router.push(`/classrooms/${classroomId}`);
    }, 1000);
  };

  const notify = () =>
    toast.custom(
      (to) =>
        to.visible && (
          <FancyToast
            message={translations('Courses.course-enrolled')}
            toastObject={to}
            className="border-indigo-500 bg-indigo-200 text-indigo-900"
          />
        ),
      {
        id: 'classroom-joined-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  return (
    <>
      {classrooms && classrooms.length > 0 ? (
        <div className="flex flex-row justify-center space-y-6">
          <ClassroomDescriptorWrapper classroomArr={classrooms} />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <p className="pb-8 text-lg font-medium">
            {translations('Classrooms.no-classrooms-found')}
          </p>
          <Image
            src="/undraw_no_data_re_kwbl.svg"
            alt="No data"
            width={200}
            height={200}
          />
        </div>
      )}
      {classrooms && classrooms.length > 0 && (
        <div className="my-16 flex items-center justify-center">
          <Image
            src="/undraw_online_learning_re_qw08.svg"
            alt="online_learning"
            width="384"
            height="276"
          />
        </div>
      )}
    </>
  );
}
