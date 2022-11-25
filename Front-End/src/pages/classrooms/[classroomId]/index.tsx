import React from 'react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useAuthRedirect } from '@app/hooks';
import { WEBSITE_TITLE } from '@app/constants';
import Footer from '@app/components/Footer';

import NavBar from '@app/components/NavBar';

export default function ClassroomsPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useDispatch();

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
          <h1>welcome to classroom</h1>
        </div>
        <Toaster />
        <Footer />
      </div>
    </>
  );
}
