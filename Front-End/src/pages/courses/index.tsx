import { useEffect } from 'react';
import Footer from '../../components/Footer';
import { useTranslations } from 'next-intl';
import NavBar from '../../components/NavBar';
import FancyCard from '../../components/FancyCard';
import { selectAuthUser, selectIsLogged } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import Image from 'next/image';
import {
  fetchCourses,
  selectCoursesData,
} from '../../features/courses/coursesSlice';

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const t = useTranslations();
  // TODO: refactor to server side fetching
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchCourses());
    };

    fetchData().catch(console.error);
  }, [dispatch]);
  const courses = useAppSelector(selectCoursesData);

  return (
    <>
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
        <div className="container px-6 mx-auto">
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 sm:gap-12">
              {courses.map((course) => (
                <FancyCard
                  key={course.id}
                  title={course.name}
                  description={course.description}
                  link={`/courses/${course.id}`}
                  cardColor="bg-gray-50"
                  shadowColor="shadow-gray-500/50"
                  hoverShadowColor="hover:shadow-gray-500/50"
                  buttonText={t('Courses.enroll')}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center w-full h-full">
              <p className="pb-8 text-lg font-medium">No courses found :(</p>
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
    },
  };
}
