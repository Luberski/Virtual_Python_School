import Image from 'next/image';
import Footer from '../components/Footer';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectIsLogged, selectAuthUser } from '../features/auth/authSlice';
import NavBar from '../components/NavBar';
import FancyCard from '../components/FancyCard';
import Head from 'next/head';
import { WEBSITE_TITLE } from '../constants';
import { useEffect } from 'react';
import {
  fetchFeaturedCourses,
  selectFeaturedCoursesData,
} from '../features/courses/featuredCoursesSlice';

// TODO: get featured courses from server
export default function IndexPage() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const featuredCourses = useAppSelector(selectFeaturedCoursesData);

  // TODO: refactor to server side fetching
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchFeaturedCourses());
    };

    fetchData().catch(console.error);
  }, [dispatch]);

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-home')} - {WEBSITE_TITLE}
        </title>
      </Head>
      <div className="w-full h-full">
        <NavBar
          user={user}
          isLoggedIn={isLoggedIn}
          logout={() =>
            dispatch({
              type: 'auth/logout',
            })
          }
        />
        <div className="container flex flex-col justify-center items-center px-6 pb-4 my-6 mx-auto">
          <div className="space-y-2">
            <h1 className="text-center">{t('Home.leading')}</h1>
            <p className="text-xl text-center">
              {t('Courses.courses-adjusted-skill-level')}
            </p>
          </div>
        </div>
        <div className="container px-6 mx-auto">
          {featuredCourses && featuredCourses.length > 0 ? (
            <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-12">
              {featuredCourses.map((course) => (
                <FancyCard
                  key={course.id}
                  title={course.name}
                  description={course.description}
                  link={`/courses`}
                  cardColor="bg-gray-50"
                  shadowColor="shadow-gray-500/50"
                  hoverShadowColor="hover:shadow-gray-500/50"
                  buttonText={t('Home.learn-more')}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center w-full h-full">
              <p className="pb-8 text-lg font-medium">
                {t('Courses.no-courses-found')}
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
        <div className="flex justify-center items-center my-16">
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
    },
  };
}
