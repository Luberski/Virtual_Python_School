import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import Footer from '@app/components/Footer';
import NavBar from '@app/components/NavBar';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchEnrolledCourses,
  selectEnrolledCoursesData,
} from '@app/features/courses/enrolled/enrolledCoursesSlice';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import EnrolledCourses from '@app/features/courses/enrolled/EnrolledCourses';

export default function EnrolledCoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const t = useTranslations();
  const enrolledCourses = useAppSelector(selectEnrolledCoursesData);

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-enrolled-courses')} - {WEBSITE_TITLE}
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
              {t('Meta.title-enrolled-courses')}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-6">
          <EnrolledCourses enrolledCourses={enrolledCourses} translations={t} />
        </div>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(
        fetchEnrolledCourses({
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
