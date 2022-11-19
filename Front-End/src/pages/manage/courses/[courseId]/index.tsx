import { useTranslations } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchLessonsByCourseId,
  selectLessonsData,
} from '@app/features/lessons/lessonsSlice';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import {
  fetchCourse,
  selectCourseData,
} from '@app/features/courses/courseSlice';
import Footer from '@app/components/Footer';
import ManageCourseAndLessons from '@app/features/courses/manage/ManageCourseAndLessons';
import { fetchCourseTagsByCourseId, selectCourseTagsData } from '@app/features/tags/courseTagsSlice';

export default function ManageCourseAndLessonsPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();

  const lessons = useAppSelector(selectLessonsData);
  const tags = useAppSelector(selectCourseTagsData);
  // TODO: use one selector for course and lessons and state
  const course = useAppSelector(selectCourseData);

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-manage')} - {WEBSITE_TITLE}
        </title>
      </Head>
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
          <div className="brand-shadow2 container flex flex-col rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
            <ManageCourseAndLessons
              course={course}
              lessons={lessons}
              tags={tags}
              translations={t}
            />
          </div>
          <Toaster />
          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { courseId } = params as { courseId: string };
      await store.dispatch(fetchCourse(Number(courseId)));
      await store.dispatch(fetchLessonsByCourseId(Number(courseId)));
      await store.dispatch(fetchCourseTagsByCourseId(Number(courseId)));

      return {
        props: {
          courseId,
          i18n: Object.assign(
            {},
            await import(`../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
