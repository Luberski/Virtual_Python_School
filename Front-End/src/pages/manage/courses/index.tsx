import { useTranslations } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useAppSelector, useAdminAuthRedirect } from '@app/hooks';
import {
  fetchCourses,
  selectCoursesData,
} from '@app/features/courses/coursesSlice';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import Footer from '@app/components/Footer';
import ManageCourses from '@app/features/courses/manage/ManageCourses';

export default function ManageCoursesPage() {
  const [user, isLoggedIn] = useAdminAuthRedirect();
  const dispatch = useDispatch();
  const t = useTranslations();
  const pageTitle = `${t('Meta.title-manage')} - ${WEBSITE_TITLE}`;
  const courses = useAppSelector(selectCoursesData);

  if (user && isLoggedIn && user?.role?.role_name === 'admin') {
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
          <div className="container mx-auto px-4">
            <div className="brand-shadow2 container flex flex-col rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
              <ManageCourses courses={courses} translations={t} />
            </div>
            <Toaster />
            <Footer />
          </div>
        </div>
      </>
    );
  }
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchCourses({}));

      return {
        props: {
          i18n: Object.assign(
            {},
            await import(`../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
