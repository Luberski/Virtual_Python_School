import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import Footer from '@app/components/Footer';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchCourses,
  selectCoursesData,
} from '@app/features/courses/coursesSlice';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import Courses from '@app/features/courses/Courses';

export default function CoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const t = useTranslations();
  const courses = useAppSelector(selectCoursesData);

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-courses')} - {WEBSITE_TITLE}
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
        <div className="container my-6 mx-auto flex flex-col items-center justify-center px-6 pb-4">
          <div className="space-y-2">
            <h1 className="text-center text-indigo-900 dark:text-indigo-300">
              {t('Home.courses')}
            </h1>
            <p className="text-center text-xl">
              {t('Courses.choose-skill-level')}
            </p>
          </div>
        </div>
        <div className="container mx-auto px-6">
          <Courses courses={courses} translations={t} />
        </div>
        <Toaster />
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(
        fetchCourses({
          includeLessons: true,
          limitLessons: 3,
        })
      );

      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
