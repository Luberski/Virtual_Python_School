import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchCourseWithLessons,
  selectCourseWithLessonsData,
} from '@app/features/courses/courseWithLessonsSlice';
import { wrapper } from '@app/store';
import Button, { ButtonVariant } from '@app/components/Button';
import {
  joinLesson,
  selectJoinLessonData,
  selectJoinLessonStatus,
} from '@app/features/lessons/joinLessonSlice';

export default function CoursePage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const course = useAppSelector(selectCourseWithLessonsData);
  const joinLessonStatus = useAppSelector(selectJoinLessonStatus);
  const joinLessonData = useAppSelector(selectJoinLessonData);
  const [currentLessonId, setCurrentLessonId] = useState(null);

  useEffect(() => {
    if (joinLessonStatus === 'succeeded') {
      router.push(
        `/courses/${course.id}/lessons/${currentLessonId}/${joinLessonData.id}`
      );
    }
  }, [
    router,
    course?.id,
    currentLessonId,
    joinLessonStatus,
    joinLessonData?.id,
  ]);

  const handleJoinLesson = (lessonId: string) => async () => {
    setCurrentLessonId(lessonId);
    await dispatch(joinLesson(lessonId));
  };

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
        {course ? (
          <div>
            <h1 className="text-indigo-900 dark:text-indigo-300">
              {course.name}
            </h1>
            <p className="word-wrap mb-6 text-2xl">{course.description}</p>
            {course?.lessons && course?.lessons.length > 0 ? (
              <div className="my-6 mx-auto w-fit overflow-auto rounded-lg border border-neutral-300 dark:border-neutral-600">
                <table className="table-auto divide-y divide-neutral-200">
                  <thead className="text-left font-medium uppercase text-neutral-500">
                    <tr>
                      <th scope="col" className="py-3 px-4">
                        ID
                      </th>
                      <th scope="col" className="py-3 px-4">
                        {t('Lessons.lesson-name')}
                      </th>
                      <th
                        scope="col"
                        className="py-3 px-4 text-center"
                        colSpan={2}>
                        {t('Manage.manage')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {course?.lessons.map((lesson) => (
                      <tr key={lesson.id}>
                        <td className="p-4">{lesson.id}</td>
                        <td className="max-w-xs break-words p-4">
                          {lesson.name}
                        </td>
                        <td className="p-4">
                          <Button
                            variant={ButtonVariant.PRIMARY}
                            onClick={handleJoinLesson(lesson.id)}>
                            {t('Lessons.join-lesson')}
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
      await store.dispatch(fetchCourseWithLessons({ id: courseId }));

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
