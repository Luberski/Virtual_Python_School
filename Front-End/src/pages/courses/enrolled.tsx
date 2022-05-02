import { useEffect } from 'react';
import Footer from '../../components/Footer';
import { useTranslations } from 'next-intl';
import NavBar from '../../components/NavBar';
import FancyCard from '../../components/FancyCard';
import { useAppDispatch, useAppSelector, useAuthRedirect } from '../../hooks';
import Image from 'next/image';
import {
  fetchEnrolledCourses,
  selectEnrolledCoursesData,
} from '../../features/courses/enrolledCoursesSlice';
import { WEBSITE_TITLE } from '../../constants';
import Head from 'next/head';

export default function EnrolledCoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const courses = useAppSelector(selectEnrolledCoursesData);

  // TODO: refactor to server side fetching
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchEnrolledCourses());
    };

    fetchData().catch(console.error);
  }, [dispatch, isLoggedIn]);

  if (!user && !isLoggedIn) {
    return null;
  }
  return (
    <>
      <Head>
        <title>
          {t('Meta.title-enrolled-courses')} - {WEBSITE_TITLE}
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
            <h1 className="text-center">{t('Meta.title-enrolled-courses')}</h1>
          </div>
        </div>
        <div className="container px-12 mx-auto">
          {courses && courses.length > 0 ? (
            <div className="grid gap-6 sm:grid-flow-col sm:gap-12">
              {courses.map((course) => (
                <FancyCard
                  key={course.id}
                  title={course.name}
                  description={course.description}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  link={`/courses/${course.id_course}`}
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
                {t('Courses.no-enrolled-courses-found')}
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
        {courses && courses.length > 0 && (
          <div className="flex justify-center items-center my-16">
            <Image
              src={'/undraw_knowledge_re_5v9l.svg'}
              alt="login"
              width="466"
              height="330"
            />
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
    },
  };
}
