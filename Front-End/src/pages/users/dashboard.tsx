import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { AcademicCapIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import Footer from '@app/components/Footer';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import {
  fetchDashboard,
  selectDashboardData,
} from '@app/features/dashboard/dashboardSlice';

export default function UserDashboardPage() {
  const t = useTranslations();
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const dashboardData = useAppSelector(selectDashboardData);

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-dashboard')} - {WEBSITE_TITLE}
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
        <div className="brand-shadow2 container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
          <div className="container mx-auto px-6 pt-6">
            <div className="flex flex-col">
              <div className="flex">
                {dashboardData && (
                  <div className=" flex flex-col">
                    <h3 className="pb-6 text-indigo-900 dark:text-indigo-300">
                      {t('Dashboard.my-stats')}
                    </h3>
                    <div className="brand-shadow2 flex space-x-6 rounded-lg bg-white p-6 shadow-black/25 dark:bg-neutral-700">
                      <div className="flex flex-col items-center justify-center text-blue-500">
                        <AcademicCapIcon className="h-9 w-9" />
                        <div className="text-2xl font-bold">
                          {dashboardData.total_enrolled_lessions_count}
                        </div>
                        <div>{t('Lessons.enrolled-lessons')}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center text-green-500">
                        <FaceSmileIcon className="h-9 w-9" />
                        <div className="text-2xl font-bold">
                          {dashboardData.total_completed_lessons_count}
                        </div>
                        <div>{t('Lessons.completed-lessons')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
