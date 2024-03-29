import { useTranslations } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchEnrolledLesson,
  selectEnrolledLessonData,
} from '@app/features/lessons/enrolled/enrolledLessonSlice';
import Footer from '@app/components/Footer';
import { wrapper } from '@app/store';
import EnrolledLesson from '@app/features/lessons/enrolled/EnrolledLesson';
import {
  fetchKnowledgeTestByLessonId,
  selectKnowledgeTestData,
} from '@app/features/dynamic-courses/knowledge-test/knowledgeTestSlice';

type Props = {
  courseId: string;
  lessonId: string;
  enrolledLessonId: string;
};

export default function LessonPage({
  courseId,
  lessonId,
  enrolledLessonId,
}: Props) {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const t = useTranslations();
  const enrolledLesson = useAppSelector(selectEnrolledLessonData);
  const knowledgeTestData = useAppSelector(selectKnowledgeTestData);

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
            <EnrolledLesson
              translations={t}
              enrolledLesson={enrolledLesson}
              enrolledLessonId={enrolledLessonId}
              courseId={courseId}
              lessonId={lessonId}
              knowledgeTest={knowledgeTestData}
            />
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
      const { courseId, lessonId, enrolledLessonId } = params as {
        courseId: string;
        lessonId: string;
        enrolledLessonId: string;
      };
      await store.dispatch(
        fetchEnrolledLesson({
          lessonId: Number(lessonId),
          enrolledLessonId: Number(enrolledLessonId),
        })
      );
      await store.dispatch(fetchKnowledgeTestByLessonId(Number(lessonId)));

      return {
        props: {
          courseId,
          lessonId,
          enrolledLessonId,
          i18n: Object.assign(
            {},
            await import(`../../../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
