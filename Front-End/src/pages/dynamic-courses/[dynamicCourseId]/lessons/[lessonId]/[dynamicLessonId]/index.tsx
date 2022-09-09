import { useTranslations } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import Footer from '@app/components/Footer';
import { wrapper } from '@app/store';
import EnrolledLesson from '@app/features/lessons/enrolled/EnrolledLesson';
import {
  fetchDynamicLesson,
  selectDynamicLessonData,
} from '@app/features/dynamic-courses/dynamicLessonSlice';

type Props = {
  dynamicCourseId: string;
  lessonId: string;
  dynamicLessonId: string;
};

export default function DynamicLessonPage({
  dynamicCourseId,
  lessonId,
  dynamicLessonId,
}: Props) {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const t = useTranslations();
  const dynamicLesson = useAppSelector(selectDynamicLessonData);

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <>
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
        <div className="container mx-auto px-4">
          <div className="brand-shadow2 container my-6 flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
            {dynamicLesson && (
              <EnrolledLesson
                translations={t}
                isDynamic={true}
                enrolledLesson={{
                  id: dynamicLesson.id,
                  lessonId: dynamicLesson.lesson_id,
                  startDate: dynamicLesson.start_date,
                  endDate: dynamicLesson.end_date,
                  completed: dynamicLesson.completed,
                  name: dynamicLesson.name,
                  description: dynamicLesson.description,
                }}
                enrolledLessonId={dynamicLessonId}
                courseId={dynamicCourseId}
                lessonId={lessonId}
              />
            )}
          </div>
          <Footer />
        </div>
      </div>
      <Toaster />
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { dynamicCourseId, lessonId, dynamicLessonId } = params as {
        dynamicCourseId: string;
        lessonId: string;
        dynamicLessonId: string;
      };
      await store.dispatch(
        fetchDynamicLesson({
          dynamicCourseId: Number(dynamicCourseId),
          dynamicLessonId: Number(dynamicLessonId),
        })
      );

      return {
        props: {
          dynamicCourseId,
          lessonId,
          dynamicLessonId,
          i18n: Object.assign(
            {},
            await import(`../../../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
