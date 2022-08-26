import Head from 'next/Head';
import { useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { wrapper } from '@app/store';
import SurveyForm from '@app/features/dynamic-courses/survey/SurveyForm';
import {
  fetchFeaturedSurvey,
  selectSurveyData,
} from '@app/features/dynamic-courses/survey/surveySlice';

export default function SurveyPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();

  const dispatch = useDispatch();
  const survey = useAppSelector(selectSurveyData);

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
        <div className="container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow dark:bg-neutral-800">
          {survey ? (
            <>
              <h1 className="pb-6 text-center text-indigo-900 dark:text-indigo-300">
                {t('Survey.leading')}
              </h1>
              <SurveyForm survey={survey} translations={t} />
            </>
          ) : (
            <div>
              <h1 className="text-center">{t('Survey.not-found')}</h1>
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
      await store.dispatch(fetchFeaturedSurvey());
      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
