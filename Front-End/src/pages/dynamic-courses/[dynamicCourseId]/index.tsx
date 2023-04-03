import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { wrapper } from '@app/store';
import EnrolledCourse from '@app/features/courses/enrolled/EnrolledCourse';
import {
  fetchDynamicCourse,
  selectDynamicCourseData,
} from '@app/features/dynamic-courses/dynamicCourseSlice';

export default function DynamicCoursePage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useDispatch();

  const dynamicCourse = useAppSelector(selectDynamicCourseData);

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
      <div className="brand-shadow2 container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
        <EnrolledCourse
          translations={t}
          enrolledCourse={{
            id: dynamicCourse?.id,
            name: t('DynamicCourse.course-name'),
            course_id: null,
            description: null,
            total_lessons_count: dynamicCourse?.total_lessons_count,
            total_completed_lessons_count:
              dynamicCourse?.total_completed_lessons_count,
            featured: null,
            is_dynamic: true,
            enrolled: true,
            start_date: null,
            end_date: null,
            lessons: dynamicCourse?.lessons.map((lesson) => ({
              id: lesson.id,
              lessonId: lesson.lesson_id,
              name: lesson.name,
              description: lesson.description,
              type: lesson.type,
              start_date: lesson.start_date,
              end_date: lesson.end_date,
              completed: lesson.completed,
            })),
          }}
        />
      </div>
    </div>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { dynamicCourseId } = params as {
        dynamicCourseId: string;
      };
      await store.dispatch(fetchDynamicCourse(Number(dynamicCourseId)));

      return {
        props: {
          dynamicCourseId,
          i18n: Object.assign(
            {},
            await import(`../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
