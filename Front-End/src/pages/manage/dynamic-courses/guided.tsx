import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useAdminAuthRedirect } from '@app/hooks';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import GuidedDynamicCourseForm from '@app/features/dynamic-courses/guided/GuidedDynamicCourseForm';
import Footer from '@app/components/Footer';

export default function GuidedDynamicCoursePage() {
  const [user, isLoggedIn] = useAdminAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();
  const pageTitle = `${t('Meta.title-manage')} - ${WEBSITE_TITLE}`;

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
          <div className="brand-shadow2 container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
            <h1 className="pb-6 text-center text-sky-900 dark:text-sky-300">
              {t('Survey.leading')}
            </h1>
            <GuidedDynamicCourseForm translations={t} />
          </div>
          <Footer />
        </div>
      </>
    );
  }
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
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
