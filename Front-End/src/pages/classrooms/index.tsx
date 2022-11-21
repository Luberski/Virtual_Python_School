import React from 'react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import { WEBSITE_TITLE } from '@app/constants';
import Footer from '@app/components/Footer';

import NavBar from '@app/components/NavBar';
import { wrapper } from '@app/store';
import {
  fetchClassrooms,
  selectClassroomsData,
} from '@app/features/classrooms/classroomsSlice';
import Classrooms from '@app/features/classrooms/Classrooms';

export default function ClassroomsPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useDispatch();
  const classrooms = useAppSelector(selectClassroomsData);

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-classrooms')} - {WEBSITE_TITLE}
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
        <div className="container my-6 mx-auto flex flex-col items-center justify-center px-6 pb-6">
          <div className="space-y-2">
            <h1 className="text-center text-indigo-900 dark:text-indigo-300">
              {t('Classrooms.classrooms')}
            </h1>
            <p className="text-center text-xl">
              {t('Classrooms.join-or-create')}
            </p>
          </div>
        </div>
        <div className="container mx-auto px-6">
          <Classrooms classrooms={classrooms} translations={t} />
        </div>
        <Toaster />
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchClassrooms());

      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
