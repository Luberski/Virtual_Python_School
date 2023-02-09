import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { wrapper } from '@app/store';
import GlobalKnowledgeTestForm from '@app/features/dynamic-courses/global-knowledge-test/GlobalKnowledgeTestForm';
import {
  fetchFeaturedGlobalKnowledgeTest,
  selectGlobalKnowledgeTestData,
} from '@app/features/dynamic-courses/global-knowledge-test/globalKnowledgeTestSlice';

export default function GlobalKnowledgeTestPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();

  const dispatch = useDispatch();
  const globalKnowledgeTest = useAppSelector(selectGlobalKnowledgeTestData);

  if (!user && !isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-dynamic-course')} - {WEBSITE_TITLE}
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
          {globalKnowledgeTest ? (
            <>
              <h1 className="pb-6 text-center text-sky-900 dark:text-sky-300">
                {t('KnowledgeTest.leading-global')}
              </h1>
              <GlobalKnowledgeTestForm
                globalKnowledgeTest={globalKnowledgeTest}
                translations={t}
              />
            </>
          ) : (
            <div>
              <h1 className="text-center">{t('KnowledgeTest.not-found')}</h1>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchFeaturedGlobalKnowledgeTest());
      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
