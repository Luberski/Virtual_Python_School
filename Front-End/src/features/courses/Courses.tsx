import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';
import { CheckBadgeIcon as CheckBadgeIconOutline } from '@heroicons/react/24/outline';
import ISO6391 from 'iso-639-1';
import FancyCard from '@app/components/FancyCard';
import { enrollCourse } from '@app/features/courses/enrollCourseSlice';
import FancyToast from '@app/components/FancyToast';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import type Course from '@app/models/Course';
import { LESSONS_LIMIT, TAG_COLORS } from '@app/constants';

type CoursesProps = {
  courses: Course[];
  translations: (key: string, ...params: unknown[]) => string;
};

export default function Courses({ courses, translations }: CoursesProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleEnrollCourse = (courseId: number) => async () => {
    try {
      const { payload } = await dispatch(enrollCourse(courseId));
      notify();
      // wait 1 second to show the toast
      setTimeout(() => {
        toast.remove('course-enrolled-notification');
        router.push(`/courses/${payload.data.id}`);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const notify = () =>
    toast.custom(
      (to) =>
        to.visible && (
          <FancyToast
            message={translations('Courses.course-enrolled')}
            toastObject={to}
            className="border-sky-500 bg-sky-200 text-sky-900"
          />
        ),
      {
        id: 'course-enrolled-notification',
        position: 'top-center',
        duration: 1000,
      }
    );

  return (
    <>
      {courses && courses.length > 0 ? (
        <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-4">
          {courses.map((course) => {
            const intl = new Intl.DisplayNames(router.locale, {
              type: 'language',
            });
            return (
              <FancyCard
                key={course.id}
                title={course.name}
                description={
                  <div className="flex flex-col">
                    {course.lang && (
                      <div className="mb-2 text-sm">
                        {translations('Meta.language')}:&nbsp;
                        {intl?.of(course.lang).length > 2
                          ? intl.of(course.lang)
                          : ISO6391.getName(course.lang)}
                      </div>
                    )}
                    {course.tags && course.tags.length > 0 && (
                      <div className="mb-2 flex max-h-16 flex-wrap overflow-auto text-sm">
                        {course.tags.map((tag, index) => (
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
                    <div className="truncate">{course.description}</div>
                    <div>
                      <div className="mt-4 mb-1 text-xs text-neutral-400">
                        {translations('Lessons.list-of-lessons')}
                      </div>
                      {course.lessons?.length > 0 &&
                        course.lessons?.map((lesson) => (
                          <div key={lesson.id}>
                            <div className="text-sm text-sky-900 dark:text-sky-300">
                              {lesson.name}
                            </div>
                          </div>
                        ))}
                      {LESSONS_LIMIT < course.total_lessons_count && (
                        <div className="text-xs lowercase text-neutral-400">
                          {course.total_lessons_count - LESSONS_LIMIT}
                          &nbsp;{translations('Home.more')}
                        </div>
                      )}
                    </div>
                  </div>
                }
                cardColor="bg-white"
                shadowColor="shadow-black/25"
                hoverShadowColor="hover:shadow-black/25"
                bottomControls={
                  course.enrolled ? (
                    <Link href={`/courses/enrolled`} passHref={true}>
                      <IconButtonLink
                        className="w-fit"
                        variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                        icon={<CheckBadgeIcon className="h-5 w-5" />}>
                        {translations('Courses.enrolled')}
                      </IconButtonLink>
                    </Link>
                  ) : (
                    <IconButton
                      variant={IconButtonVariant.PRIMARY}
                      icon={<CheckBadgeIconOutline className="h-5 w-5" />}
                      onClick={handleEnrollCourse(course.id)}>
                      {translations('Courses.enroll')}
                    </IconButton>
                  )
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <p className="pb-8 text-lg font-medium">
            {translations('Courses.no-courses-found')}
          </p>
          <Image
            src="/undraw_no_data_re_kwbl.svg"
            alt="No data"
            width={200}
            height={200}
          />
        </div>
      )}
      {courses && courses.length > 0 && (
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
