import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import Footer from '@app/components/Footer';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import NavBar from '@app/components/NavBar';
import { COURSES_LIMIT, LESSONS_LIMIT, WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import {
  fetchDashboard,
  selectDashboardData,
} from '@app/features/dashboard/dashboardSlice';
import {
  fetchEnrolledCourses,
  selectEnrolledCoursesData,
} from '@app/features/courses/enrolled/enrolledCoursesSlice';
import {
  fetchRecommendedCourses,
  selectRecommendedCoursesData,
} from '@app/features/recommender/recommendedCoursesSlice';
import {
  fetchRecommendedLessons,
  selectRecommendedLessonsData,
} from '@app/features/recommender/recommendedLessonsSlice';
import Dashboard from '@app/features/dashboard/Dashboard';

export default function UserDashboardPage() {
  const t = useTranslations();
  const pageTitle = `${t('Meta.title-dashboard')} - ${WEBSITE_TITLE}`;
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const enrolledCourses = useAppSelector(selectEnrolledCoursesData);
  const recommendedCoursesData = useAppSelector(selectRecommendedCoursesData);
  const recommendedLessonsData = useAppSelector(selectRecommendedLessonsData);

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
        <div className="brand-shadow2 container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
          <div className="container mx-auto px-6 pt-6">
            <Dashboard
              translations={t}
              dashboardData={dashboardData}
              enrolledCourses={enrolledCourses}
              recommendedCoursesData={recommendedCoursesData}
              recommendedLessonsData={recommendedLessonsData}
            />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchDashboard());
      await store.dispatch(
        fetchEnrolledCourses({
          includeLessons: true,
          limitLessons: LESSONS_LIMIT,
          limit: COURSES_LIMIT,
        })
      );
      await store.dispatch(fetchRecommendedCourses());
      await store.dispatch(fetchRecommendedLessons());

      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
