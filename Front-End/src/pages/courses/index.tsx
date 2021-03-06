import Footer from '../../components/Footer';
import { useTranslations } from 'next-intl';
import NavBar from '../../components/NavBar';
import FancyCard from '../../components/FancyCard';
import { useAppDispatch, useAppSelector, useAuthRedirect } from '../../hooks';
import Image from 'next/image';
import {
  fetchCourses,
  selectCoursesData,
} from '../../features/courses/coursesSlice';
import { WEBSITE_TITLE } from '../../constants';
import Head from 'next/head';
import { enrollCourse } from '../../features/courses/courseSlice';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { wrapper } from '../../store';
import FancyToast from '../../components/FancyToast';

export default function CoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const courses = useAppSelector(selectCoursesData);
  const router = useRouter();

  const handleEnrollCourse = (courseId: string) => async () => {
    await dispatch(enrollCourse(courseId));
    notify();
    router.push(`/courses/${courseId}`);
  };

  const notify = () =>
    toast.custom(
      (to) => (
        <FancyToast
          message={t('Courses.course-enrolled')}
          toastObject={to}
          className="text-indigo-900 bg-indigo-200 border-indigo-500"
        />
      ),
      { id: 'unique-notification', position: 'top-center' }
    );

  if (!user && !isLoggedIn) {
    return null;
  }
  return (
    <>
      <Head>
        <title>
          {t('Meta.title-courses')} - {WEBSITE_TITLE}
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
            <h1 className="text-center">{t('Home.courses')}</h1>
            <p className="text-xl text-center">
              {t('Courses.choose-skill-level')}
            </p>
          </div>
        </div>
        <div className="container px-12 mx-auto">
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-12">
              {courses.map((course) => (
                <FancyCard
                  key={course.id}
                  title={course.name}
                  description={course.description}
                  cardColor="bg-gray-50"
                  shadowColor="shadow-gray-500/50"
                  hoverShadowColor="hover:shadow-gray-500/50"
                  buttonText={t('Courses.enroll')}
                  onClick={handleEnrollCourse(course.id)}
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
        <Toaster />
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchCourses());

      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
