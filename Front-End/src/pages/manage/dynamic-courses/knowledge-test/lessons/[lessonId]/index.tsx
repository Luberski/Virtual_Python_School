import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useAuthRedirect } from '@app/hooks';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import GuidedKnowledgeTestForm from '@app/features/dynamic-courses/knowledge-test/guided/GuidedKnowledgeTestForm';
import Footer from '@app/components/Footer';

type GuidedKnowledgeTestPageProps = {
  lessonId: number;
};

export default function GuidedKnowledgeTestPage({
  lessonId,
}: GuidedKnowledgeTestPageProps) {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();

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
        <div className="brand-shadow2 container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
          <h1 className="pb-6 text-center text-sky-900 dark:text-sky-300">
            {t('KnowledgeTest.leading')}
          </h1>
          <GuidedKnowledgeTestForm translations={t} lessonId={lessonId} />
        </div>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { lessonId } = params as {
        lessonId: string;
      };

      return {
        props: {
          lessonId,
          i18n: Object.assign(
            {},
            await import(`../../../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
