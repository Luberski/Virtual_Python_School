import Image from 'next/image';
import Link from 'next/link';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import FancyCard from '@app/components/FancyCard';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import type { Course } from '@app/models/Course';

type EnrolledCoursesProps = {
  enrolledCourses: Course[];
  translations: (key: string) => string;
};

export default function EnrolledCourses({
  enrolledCourses,
  translations,
}: EnrolledCoursesProps) {
  return (
    <>
      {enrolledCourses && enrolledCourses.length > 0 ? (
        <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-4">
          {enrolledCourses.map((enrolledCourse) => {
            const lessonsCompletedPercentage = Math.round(
              (enrolledCourse.total_completed_lessons_count /
                enrolledCourse.total_lessons_count) *
                100
            );
            return (
              <FancyCard
                key={enrolledCourse.id}
                title={enrolledCourse.name}
                description={
                  <div className="flex flex-col">
                    <div className="flex space-x-2">
                      <div className="my-2 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700">
                        <div
                          className="h-2 rounded-lg bg-indigo-600"
                          style={{
                            width: `${lessonsCompletedPercentage}%`,
                          }}
                        />
                      </div>
                      <div className="text-sm text-neutral-500">
                        {lessonsCompletedPercentage}%
                      </div>
                    </div>
                    {enrolledCourse.description}
                    <div>
                      <div className="mt-4 mb-1 text-xs text-neutral-400">
                        {translations('Manage.name')}
                      </div>
                      {enrolledCourse.lessons?.length > 0 &&
                        enrolledCourse.lessons?.map((lesson) => (
                          <div key={lesson.id}>
                            <div className="text-indigo-900 dark:text-indigo-300">
                              {lesson.name}
                            </div>
                          </div>
                        ))}
                      ...
                    </div>
                  </div>
                }
                cardColor="bg-white"
                shadowColor="shadow-black/25"
                hoverShadowColor="hover:shadow-black/25"
                bottomControls={
                  <Link href={`/courses/${enrolledCourse.id}`} passHref={true}>
                    <IconButtonLink
                      variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                      icon={<InformationCircleIcon className="h-5 w-5" />}>
                      {translations('Home.more')}
                    </IconButtonLink>
                  </Link>
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <p className="pb-8 text-lg font-medium">
            {translations('Courses.no-enrolled-courses-found')}
          </p>
          <Image
            src="/undraw_no_data_re_kwbl.svg"
            alt="No data"
            width={200}
            height={200}
          />
        </div>
      )}
      {enrolledCourses && enrolledCourses.length > 0 && (
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