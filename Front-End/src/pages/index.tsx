import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import Footer from '@app/components/Footer';
import { useAppSelector } from '@app/hooks';
import { selectIsLogged, selectAuthUser } from '@app/features/auth/authSlice';
import NavBar from '@app/components/NavBar';
import { WEBSITE_TITLE } from '@app/constants';
import FeaturedCourses from '@app/features/courses/featured/FeaturedCourses';
import {
  fetchFeaturedCourses,
  selectFeaturedCoursesData,
} from '@app/features/courses/featured/featuredCoursesSlice';
import { wrapper } from '@app/store';

export default function IndexPage() {
  const t = useTranslations();
  const dispatch = useDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const featuredCourses = useAppSelector(selectFeaturedCoursesData);

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-home')} - {WEBSITE_TITLE}
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
        <div className="container my-6 mx-auto flex flex-col items-center justify-center px-6 pb-4">
          <div className="space-y-2">
            <h1 className="text-center text-indigo-900 dark:text-indigo-300">
              {t('Home.leading')}
            </h1>
            <p className="text-center text-xl">
              {t('Courses.courses-adjusted-skill-level')}
            </p>
          </div>
        </div>
        <div className="container mx-auto px-6">
          <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-4">
            <FeaturedCourses
              featuredCourses={featuredCourses}
              translations={t}
            />
          </div>
        </div>
        <div className="my-16 flex items-center justify-center">
          <Image
            src={'/undraw_online_learning_re_qw08.svg'}
            alt="online_learning"
            width="466"
            height="330"
          />
        </div>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchFeaturedCourses());

      return {
        props: {
          i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
        },
      };
    }
);
