import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { AcademicCapIcon, CheckBadgeIcon } from '@heroicons/react/20/solid';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchEnrolledCourseWithLessons,
  selectEnrolledCourseWithLessonsData,
} from '@app/features/courses/enrolled/enrolledCourseWithLessonsSlice';
import { wrapper } from '@app/store';
import Button, { ButtonVariant } from '@app/components/Button';
import {
  enrollLesson,
  selectJoinLessonData,
  selectJoinLessonStatus,
} from '@app/features/lessons/enrollLessonSlice';

export default function CoursePage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const enrolledCourse = useAppSelector(selectEnrolledCourseWithLessonsData);
  const enrollLessonStatus = useAppSelector(selectJoinLessonStatus);
  const enrollLessonData = useAppSelector(selectJoinLessonData);
  const [currentLessonId, setCurrentLessonId] = useState(null);

  useEffect(() => {
    if (enrollLessonStatus === 'succeeded') {
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
  ]);

  const handleJoinLesson = (lessonId: number) => async () => {
    setCurrentLessonId(lessonId);
    await dispatch(
      enrollLesson({ lessonId, enrolledCourseId: enrolledCourse?.id })
    );
  };

  const lessonsCompletedPercentage = Math.round(
    (enrolledCourse?.total_completed_lessons_count /
      enrolledCourse?.total_lessons_count) *
      100
  );

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <div className="h-full w-full">
      <NavBar
        user={user}
        isLoggedIn={isLoggedIn}
        logout={() =>
          dispatch({
            type: 'auth/logout',
          })
        }
      />
      <div className="container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow dark:bg-neutral-800">
        {enrolledCourse ? (
          <div>
            <h1 className="text-indigo-900 dark:text-indigo-300">
              {enrolledCourse.name}
            </h1>
            <p className="word-wrap mb-6 text-2xl">
              {enrolledCourse.description}
            </p>
            <div className="flex space-x-8">
              <div className="brand-shadow flex w-96 flex-col space-y-2 rounded-lg bg-indigo-50 p-9 text-indigo-900 shadow-indigo-900/25 dark:bg-indigo-400/25 dark:text-indigo-300">
                <div className="flex items-center">
                  <CheckBadgeIcon className="mr-2 h-9 w-9" />
                  <h3 className="text-indigo-900 dark:text-indigo-300">
                    Overview
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xl font-medium">Progress</div>
                  <div className="mt-2 flex w-full items-center space-x-2">
                    <div className="w-full rounded-lg bg-neutral-200 dark:bg-neutral-700">
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
                <div className="flex items-center space-x-3">
                  <div className="text-xl font-medium">Lessons Completed</div>
                  <span className="mt-1 text-base font-normal">
                    {enrolledCourse?.total_completed_lessons_count}/
                    {enrolledCourse?.total_lessons_count}
                  </span>
                </div>
              </div>
              {enrolledCourse?.lessons && enrolledCourse?.lessons.length > 0 ? (
                <div className="brand-shadow flex flex-col space-y-2 rounded-lg bg-neutral-50 p-9 shadow-black/25 dark:bg-neutral-700">
                  <div className="flex items-center">
                    <AcademicCapIcon className="mr-2 h-9 w-9" />
                    <h3>Lessons</h3>
                  </div>
                  <table className="table-auto divide-y divide-neutral-200">
                    <thead className="text-left font-medium text-neutral-500">
                      <tr>
                        <th scope="col" className="py-3 px-4">
                          {t('Manage.name')}
                        </th>
                        <th scope="col" className="py-3 px-4 text-center">
                          {t('Manage.status')}
                        </th>
                        <th scope="col" className="py-3 px-4 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 font-medium">
                      {enrolledCourse?.lessons.map((lesson) => (
                        <tr key={lesson.id}>
                          <td className="p-4">{lesson.name}</td>
                          <td className="p-4 text-center">
                            {lesson.completed?.toString() === 'true' ? (
                              <div className="text-indigo-600 dark:text-indigo-300">
                                {t('Manage.completed')}
                              </div>
                            ) : (
                              <div className="font-bold">-</div>
                            )}
                          </td>
                          <td className="p-4">
                            <Button
                              variant={ButtonVariant.FLAT_PRIMARY}
                              onClick={handleJoinLesson(lesson.id)}>
                              {t('Manage.try')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col justify-center">
                  <p className="pb-8 text-lg font-medium">
                    {t('Lessons.no-lessons-found')}
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
              {t('Courses.course-not-found')}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { courseId } = params as {
        courseId: string;
      };
      await store.dispatch(fetchEnrolledCourseWithLessons({ id: courseId }));

      return {
        props: {
          courseId,
          i18n: Object.assign(
            {},
            await import(`../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
