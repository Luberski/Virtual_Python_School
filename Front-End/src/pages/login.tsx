import { useEffect } from 'react';
import Footer from '../components/Footer';
import Input from '../components/Input';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import ButtonInput, { ButtonInputVariant } from '../components/ButtonInput';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  loginUser,
  selectAuthError,
  selectAuthStatus,
  selectAuthUser,
  selectIsLogged,
} from '../features/auth/authSlice';
import NavBar from '../components/NavBar';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const error = useAppSelector(selectAuthError);
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);

  useEffect(() => {
    if (user && isLoggedIn) {
      router.push('/');
    }
  }, [user, isLoggedIn, router]);

  const onSubmit = async (data) => {
    const { username, password } = data;

    try {
      await dispatch(loginUser({ username, password }));
      if (status === 'succeeded') {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="w-full h-full">
        <NavBar />
        <div className="container flex flex-col justify-center items-center px-6 pb-4 my-6 mx-auto">
          <div>
            <h1 className="text-center">{t('Auth.welcome-back')}</h1>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          <form
            className="flex flex-col justify-center items-center space-y-8"
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
            <ButtonInput
              variant={ButtonInputVariant.PRIMARY}
              className="w-36"
              type="submit"
              value={t('Auth.login')}
            />
            {status === 'failed' && error && (
              <div className="py-2 px-4 text-red-700 bg-red-300 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>
        <div className="flex justify-center items-center my-16">
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
    },
  };
}
