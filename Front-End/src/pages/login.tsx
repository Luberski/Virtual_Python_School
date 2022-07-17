import { useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import Footer from '../components/Footer';
import Input from '../components/Input';
import { useAppSelector } from '../hooks';
import {
  loginUser,
  selectAuthError,
  selectAuthStatus,
  selectAuthUser,
  selectIsLogged,
} from '../features/auth/authSlice';
import NavBar from '../components/NavBar';
import IconButton, { IconButtonVariant } from '../components/IconButton';
import { WEBSITE_TITLE } from '../constants';

export default function LoginPage() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);

  useEffect(() => {
    if (user && isLoggedIn) {
      router.replace('/');
    }
  }, [user, isLoggedIn, router]);

  const onSubmit = (data: { username: string; password: string }) => {
    const { username, password } = data;

    try {
      dispatch(loginUser({ username, password }));
      if (status === 'succeeded') {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-login')} - {WEBSITE_TITLE}
        </title>
      </Head>
      <div className="h-full w-full">
        <NavBar />
        <div className="container my-6 mx-auto flex flex-col items-center justify-center px-6 pb-4">
          <div>
            <h1 className="text-center">{t('Auth.welcome-back')}</h1>
          </div>
        </div>
        <div className="container mx-auto px-6">
          <form
            className="flex flex-col items-center justify-center space-y-6"
            onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="username"
              type="username"
              placeholder={t('Auth.username')}
              register={register}
              required
            />
            <Input
              label="password"
              type="password"
              placeholder={t('Auth.password')}
              register={register}
              required
            />
            <IconButton
              variant={IconButtonVariant.SECONDARY}
              type="submit"
              icon={
                status === 'pending' ? (
                  <svg
                    className="mr-1 h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <div className="relative top-0.5">
                    <Image
                      width="24"
                      height="16"
                      src="/ZUT_logo_kolor.svg"
                      alt="zut logo"
                    />
                  </div>
                )
              }>
              {t('Auth.login')}
            </IconButton>
            {status === 'failed' && error && (
              <div className="rounded-lg bg-red-300 py-2 px-4 text-red-700">
                {error}
              </div>
            )}
          </form>
        </div>
        <div className="my-16 flex items-center justify-center">
          <Image
            src={'/undraw_login_re_4vu2.svg'}
            alt="login"
            width="466"
            height="330"
          />
        </div>
        <Footer />
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
