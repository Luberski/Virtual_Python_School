import { useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Footer from '@app/components/Footer';
import { useAppSelector } from '@app/hooks';
import { selectAuthUser, selectIsLogged } from '@app/features/auth/authSlice';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import LoginForm from '@app/features/auth/LoginForm';

export default function LoginPage() {
  const t = useTranslations();
  const pageTitle = `${t('Meta.title-login')} - ${WEBSITE_TITLE}`;
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const router = useRouter();

  useEffect(() => {
    if (user && isLoggedIn) {
      router.replace('/');
    }
  }, [user, isLoggedIn, router]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="h-full w-full">
        <NavBar />
        <div className="brand-shadow2 container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
          <h1 className="text-center text-sky-900 dark:text-sky-300">
            {t('Auth.welcome-back')}
          </h1>
          <div className="container mx-auto px-6 pt-6">
            <LoginForm translations={t} />
          </div>
          <div className="my-16 flex items-center justify-center">
            <Image
              src={'/undraw_login_re_4vu2.svg'}
              alt="login"
              width="384"
              height="229"
            />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
    },
  };
}
