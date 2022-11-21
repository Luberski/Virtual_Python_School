import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import {
  AcademicCapIcon,
  BoltIcon,
  CheckBadgeIcon,
} from '@heroicons/react/20/solid';
import ISO6391 from 'iso-639-1';
import Button, { ButtonVariant } from '@app/components/Button';
import {
  enrollLesson,
  selectJoinLessonData,
  selectJoinLessonStatus,
} from '@app/features/lessons/enrollLessonSlice';
import type EnrolledCourseModel from '@app/models/EnrolledCourse';
import { useAppSelector } from '@app/hooks';
import type Lesson from '@app/models/Lesson';
import type EnrolledLesson from '@app/models/EnrolledLesson';
import { TAG_COLORS } from '@app/constants';

type EnrolledCourseProps = {
  enrolledCourse: EnrolledCourseModel;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function EnrolledCourse({
  enrolledCourse,
  translations,
}: EnrolledCourseProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [currentLessonId, setCurrentLessonId] = useState(null);
  const enrollLessonStatus = useAppSelector(selectJoinLessonStatus);
  const enrollLessonData = useAppSelector(selectJoinLessonData);

  useEffect(() => {
    if (enrollLessonStatus === 'succeeded' && !enrolledCourse?.is_dynamic) {
      router.push(
        `/courses/${enrolledCourse.id}/lessons/${currentLessonId}/${enrollLessonData.id}`
      );
    }
  }, [
    router,
    enrolledCourse?.id,
    currentLessonId,
    enrollLessonStatus,
    enrollLessonData?.id,
    enrolledCourse?.is_dynamic,
  ]);

  const handleJoinLesson = (lesson: EnrolledLesson) => async () => {
    setCurrentLessonId(lesson.id);
    if (enrolledCourse?.is_dynamic) {
      router.push(
        `/dynamic-courses/${enrolledCourse.id}/lessons/${lesson.lessonId}/${lesson.id}`
      );
    } else {
      await dispatch(
        enrollLesson({
          lessonId: lesson.id,
          enrolledCourseId: enrolledCourse?.id,
        })
      );
    }
  };

  const lessonsCompletedPercentage =
    Math.round(
      (enrolledCourse?.total_completed_lessons_count /
        enrolledCourse?.total_lessons_count) *
        100
    ) || 0;
  const intl = new Intl.DisplayNames(router.locale, {
    type: 'language',
  });

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {enrolledCourse ? (
        <div>
          <h1 className="text-indigo-900 dark:text-indigo-300">
            {enrolledCourse.is_dynamic ? (
              <>
                <BoltIcon className="mr-1 mb-1 inline h-9 w-9" />
                {translations('DynamicCourse.course-name')}
              </>
            ) : (
              enrolledCourse.name
            )}
          </h1>
          <p className="word-wrap mb-6 text-2xl">
            {enrolledCourse.description}
          </p>
          <div className="flex flex-col space-y-8 sm:flex-row sm:space-y-0 sm:space-x-8">
            <div className="brand-shadow flex h-fit flex-col space-y-2 rounded-lg bg-neutral-50 p-9 shadow-black/25 dark:bg-neutral-700">
              <div className="flex items-center">
                <CheckBadgeIcon className="mr-2 h-9 w-9" />
                <h3>{translations('Courses.overview')}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="font-medium">
                  {translations('Courses.progress')}
                </div>
                <div className="mt-[2px] flex w-full items-center space-x-2">
                  <div className="w-full rounded-lg bg-neutral-200 dark:bg-neutral-600">
                    <div
                      className="h-2 rounded-lg bg-indigo-600"
                      style={{
                        width: `${lessonsCompletedPercentage}%`,
                      }}
                    />
                  </div>
                  <div>{lessonsCompletedPercentage}%</div>
                </div>
              </div>
              <div>
                <span className="font-medium">
                  {translations('Lessons.completed-lessons')}:&nbsp;
                </span>
                <span className="font-normal">
                  {enrolledCourse?.total_completed_lessons_count}/
                  {enrolledCourse?.total_lessons_count}
                </span>
              </div>
              {enrolledCourse.lang && (
                <div className="font-medium">
                  {translations('Meta.language')}:&nbsp;
                  <span className="font-normal">
                    {intl?.of(enrolledCourse.lang).length > 2
                      ? intl.of(enrolledCourse.lang)
                      : ISO6391.getName(enrolledCourse.lang)}
                  </span>
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
            </div>
            {enrolledCourse?.lessons && enrolledCourse?.lessons.length > 0 ? (
              <div className="brand-shadow flex flex-col space-y-2 rounded-lg bg-neutral-50 p-9 shadow-black/25 dark:bg-neutral-700">
                <div className="flex items-center">
                  <AcademicCapIcon className="mr-2 h-9 w-9" />
                  <h3>{translations('Lessons.lessons')}</h3>
                </div>
                <table className="table-auto divide-y divide-neutral-200">
                  <thead className="text-left font-medium text-neutral-500">
                    <tr>
                      <th scope="col" className="py-3 sm:px-4">
                        {translations('Manage.name')}
                      </th>
                      <th scope="col" className="py-3 text-center sm:px-4">
                        {translations('Manage.status')}
                      </th>
                      <th scope="col" className="py-3 text-center sm:px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-medium">
                    {enrolledCourse?.lessons.map(
                      (lesson: Lesson & EnrolledLesson) => (
                        <tr key={lesson.id}>
                          <td className="sm:p-4">{lesson.name}</td>
                          <td className="text-center sm:p-4">
                            {lesson.completed?.toString() === 'true' ? (
                              <div className="text-indigo-600 dark:text-indigo-300">
                                {translations('Manage.completed')}
                              </div>
                            ) : (
                              <div className="font-bold">-</div>
                            )}
                          </td>
                          <td className="sm:p-4">
                            <Button
                              variant={ButtonVariant.FLAT_PRIMARY}
                              onClick={handleJoinLesson(lesson)}>
                              {translations('Manage.try')}
                            </Button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col justify-center">
                <p className="pb-8 text-lg font-medium">
                  {translations('Lessons.no-lessons-found')}
                </p>
                <Image
                  src="/undraw_no_data_re_kwbl.svg"
                  alt="No data"
                  width={200}
                  height={200}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-center first-letter:uppercase">
            {translations('Courses.course-not-found')}
          </h1>
        </div>
      )}
    </>
  );
}
