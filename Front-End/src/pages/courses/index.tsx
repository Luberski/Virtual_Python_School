import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Head from 'next/head';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import Footer from '@app/components/Footer';
import NavBar from '@app/components/NavBar';
import FancyCard from '@app/components/FancyCard';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchCourses,
  selectCoursesData,
} from '@app/features/courses/coursesSlice';
import { WEBSITE_TITLE } from '@app/constants';
import { enrollCourse } from '@app/features/courses/courseSlice';
import { wrapper } from '@app/store';
import FancyToast from '@app/components/FancyToast';

export default function CoursesPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
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
          className="border-indigo-500 bg-indigo-200 text-indigo-900"
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
            <h1 className="text-center">{t('Home.courses')}</h1>
            <p className="text-center text-xl">
              {t('Courses.choose-skill-level')}
            </p>
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
                  cardColor="bg-gray-50"
                  shadowColor="shadow-gray-500/50"
                  hoverShadowColor="hover:shadow-gray-500/50"
                  buttonText={t('Courses.enroll')}
                  onClick={handleEnrollCourse(course.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center">
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
          <div className="my-16 flex items-center justify-center">
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
