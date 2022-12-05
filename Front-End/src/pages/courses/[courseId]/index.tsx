import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchEnrolledCourseWithLessons,
  selectEnrolledCourseWithLessonsData,
} from '@app/features/courses/enrolled/enrolledCourseWithLessonsSlice';
import { wrapper } from '@app/store';
import EnrolledCourse from '@app/features/courses/enrolled/EnrolledCourse';

export default function CoursePage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useDispatch();

  const enrolledCourse = useAppSelector(selectEnrolledCourseWithLessonsData);

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
        <EnrolledCourse translations={t} enrolledCourse={enrolledCourse} />
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
      await store.dispatch(
        fetchEnrolledCourseWithLessons({ id: Number(courseId) })
      );

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
