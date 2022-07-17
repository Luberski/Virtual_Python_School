import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import Footer from '../../components/Footer';
import NavBar from '../../components/NavBar';
import FancyCard from '../../components/FancyCard';
import { useAppSelector, useAuthRedirect } from '../../hooks';
import {
  fetchEnrolledCourses,
  selectEnrolledCoursesData,
} from '../../features/courses/enrolledCoursesSlice';
import { WEBSITE_TITLE } from '../../constants';
import { wrapper } from '../../store';

export default function EnrolledCoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const t = useTranslations();
  const courses = useAppSelector(selectEnrolledCoursesData);

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
            <h1 className="text-center">{t('Meta.title-enrolled-courses')}</h1>
          </div>
        </div>
        <div className="container mx-auto px-12">
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-12">
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
            <div className="flex h-full w-full flex-col items-center justify-center">
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
          <div className="my-16 flex items-center justify-center">
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

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchEnrolledCourses());

      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
