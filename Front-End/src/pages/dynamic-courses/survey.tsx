import Head from 'next/Head';
import { useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { wrapper } from '@app/store';
import Alert from '@app/components/Alert';
import SurveyForm from '@app/features/dynamic-courses/SurveyForm';
import {
  fetchSurvey,
  selectSurveyData,
} from '@app/features/dynamic-courses/surveySlice';

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
                {t('DynamicCourse.leading')}
              </h1>
              <Alert>
                <InformationCircleIcon className="mr-2 h-6 w-6" />
                <p className="w-fit max-w-sm">
                  {t('DynamicCourse.alert-info')}
                </p>
              </Alert>
              <SurveyForm survey={survey} />
            </>
          ) : (
            <div>Survey Not found</div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      // TODO: get survey id from query params
      await store.dispatch(fetchSurvey(1));
      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
