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
import { LESSONS_LIMIT, WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import EnrolledCourses from '@app/features/courses/enrolled/EnrolledCourses';

export default function EnrolledCoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const t = useTranslations();
  const pageTitle = `${t('Meta.title-enrolled-courses')} - ${WEBSITE_TITLE}`;
  const enrolledCourses = useAppSelector(selectEnrolledCoursesData);

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
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
        <div className="container my-6 mx-auto flex flex-col items-center justify-center px-6 pb-6">
          <h1 className="text-center text-sky-900 dark:text-sky-300">
            {t('Meta.title-enrolled-courses')}
          </h1>
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
          limitLessons: LESSONS_LIMIT,
        })
      );

      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
