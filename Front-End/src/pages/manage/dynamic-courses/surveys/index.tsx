import { useTranslations } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import Checkbox from '@app/components/Checkbox';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import {
  fetchSurveys,
  selectSurveysData,
} from '@app/features/dynamic-courses/survey/surveysSlice';
import Footer from '@app/components/Footer';

export default function ManageSurveysPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();

  const t = useTranslations();
  const surveys = useAppSelector(selectSurveysData);

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
        <div className="container mx-auto px-4">
          <div className="brand-shadow2 container flex flex-col rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
            <h1 className="pb-6 text-indigo-900 dark:text-indigo-300">
              {t('Manage.manage-surveys')}
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-xl font-medium">
                {t('Survey.list-of-surveys')}
              </p>
            </div>
            {surveys && surveys.length > 0 ? (
              <div className="my-6 overflow-auto rounded-lg border border-neutral-300 dark:border-neutral-600">
                <table className="w-full table-auto divide-y divide-neutral-200">
                  <thead className="text-left font-medium uppercase text-neutral-500">
                    <tr>
                      <th scope="col" className="py-3 px-4">
                        {t('Manage.no-short')}
                      </th>
                      <th scope="col" className="py-3 px-4">
                        {t('Manage.name')}
                      </th>
                      <th scope="col" className="py-3 px-4 text-center">
                        {t('Courses.featured')}
                      </th>
                      <th scope="col" className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {surveys.map((survey, key) => (
                      <tr key={survey.id}>
                        <td className="p-4">{(key += 1)}</td>
                        <td className="break-words p-4">{survey.name}</td>
                        <td className="p-4 text-center">
                          <Checkbox
                            id="surveyFeatured"
                            name="surveyFeatured"
                            label="surveyFeatured"
                            disabled={true}
                            checked={survey.featured}
                          />
                        </td>
                        <td className="flex space-x-4 py-4 pr-4">
                          <IconButton
                            variant={IconButtonVariant.DANGER}
                            icon={<TrashIcon className="h-5 w-5" />}>
                            {t('Manage.delete')}
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col justify-center">
                <p className="pb-8 text-lg font-medium">
                  {t('Survey.no-surveys-found')}
                </p>
                <Image
                  src="/undraw_no_data_re_kwbl.svg"
                  alt="No data"
                  width={200}
                  height={200}
                />
              </div>
            )}
          </div>
          <Toaster />
          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchSurveys());
      return {
        props: {
          i18n: Object.assign(
            {},
            await import(`../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
