import Image from 'next/image';
import Link from 'next/link';
import { BoltIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';
import ISO6391 from 'iso-639-1';
import FancyCard from '@app/components/FancyCard';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import type EnrolledCourse from '@app/models/EnrolledCourse';
import { LESSONS_LIMIT, TAG_COLORS } from '@app/constants';

type EnrolledCoursesProps = {
  enrolledCourses: EnrolledCourse[];
  translations: (key: string, ...params: unknown[]) => string;
};

export default function EnrolledCourses({
  enrolledCourses,
  translations,
}: EnrolledCoursesProps) {
  const router = useRouter();
  return (
    <>
      {enrolledCourses && enrolledCourses.length > 0 ? (
        <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-4">
          {enrolledCourses.map((enrolledCourse) => {
            const lessonsCompletedPercentage =
              Math.round(
                (enrolledCourse.total_completed_lessons_count /
                  enrolledCourse.total_lessons_count) *
                  100
              ) || 0;
            const intl = new Intl.DisplayNames(router.locale, {
              type: 'language',
            });
            return (
              <FancyCard
                key={enrolledCourse.id}
                title={
                  enrolledCourse.is_dynamic ? (
                    <div className="text-indigo-900 dark:text-indigo-300">
                      <BoltIcon className="mr-1 mb-1 inline h-5 w-5" />
                      {translations('DynamicCourse.course-name')}
                    </div>
                  ) : (
                    enrolledCourse.name
                  )
                }
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
                    {enrolledCourse.lang && (
                      <div className="mb-2 text-sm">
                        {translations('Meta.language')}:&nbsp;
                        {intl?.of(enrolledCourse.lang).length > 2
                          ? intl.of(enrolledCourse.lang)
                          : ISO6391.getName(enrolledCourse.lang)}
                      </div>
                    )}
                    {enrolledCourse.tags && enrolledCourse.tags.length > 0 && (
                      <div className="mb-2 flex max-h-16 flex-wrap overflow-auto text-sm">
                        {enrolledCourse.tags.map((tag, index) => (
                          <div
                            key={tag.id}
                            className={`mr-1 mt-1 h-6 w-fit rounded-lg px-3 py-1 text-center text-xs font-semibold ${
                              TAG_COLORS[index % TAG_COLORS.length]
                            }`}>
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    )}
                    <div>{enrolledCourse.description}</div>
                    <div>
                      <div className="mt-4 mb-1 text-xs text-neutral-400">
                        {translations('Lessons.list-of-lessons')}
                      </div>
                      <div>
                        {enrolledCourse.lessons?.length > 0 &&
                          enrolledCourse.lessons?.map((lesson) => (
                            <div key={lesson.id}>
                              <div className="text-sm text-indigo-900 dark:text-indigo-300">
                                {lesson.name}
                              </div>
                            </div>
                          ))}
                      </div>
                      {LESSONS_LIMIT < enrolledCourse.total_lessons_count && (
                        <div className="text-xs lowercase text-neutral-400">
                          {enrolledCourse.total_lessons_count - LESSONS_LIMIT}
                          &nbsp;{translations('Home.more')}
                        </div>
                      )}
                    </div>
                  </div>
                }
                cardColor={
                  enrolledCourse.is_dynamic
                    ? 'bg-indigo-50 dark:bg-indigo-400/25'
                    : 'bg-white'
                }
                shadowColor={
                  enrolledCourse.is_dynamic
                    ? 'shadow-indigo-900/25'
                    : 'shadow-black/25'
                }
                hoverShadowColor="hover:shadow-black/25"
                bottomControls={
                  <Link
                    href={
                      enrolledCourse.is_dynamic
                        ? `/dynamic-courses/${enrolledCourse.id}`
                        : `/courses/${enrolledCourse.id}`
                    }
                    passHref={true}>
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
