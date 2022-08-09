import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { InformationCircleIcon } from '@heroicons/react/solid';
import Footer from '@app/components/Footer';
import NavBar from '@app/components/NavBar';
import FancyCard from '@app/components/FancyCard';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import {
  fetchEnrolledCourses,
  selectEnrolledCoursesData,
} from '@app/features/courses/enrolledCoursesSlice';
import { WEBSITE_TITLE } from '@app/constants';
import { wrapper } from '@app/store';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';

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
            <div className="flex flex-col justify-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-12">
              {courses.map((course) => (
                <FancyCard
                  key={course.id}
                  title={course.name}
                  description={course.description}
                  cardColor="bg-white"
                  shadowColor="shadow-black/25"
                  hoverShadowColor="hover:shadow-black/25"
                  bottomControls={
                    <Link href={`/courses/${course.id}`} passHref={true}>
                      <IconButtonLink
                        className="w-fit"
                        variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                        icon={<InformationCircleIcon className="h-5 w-5" />}>
                        {t('Home.more')}
                      </IconButtonLink>
                    </Link>
                  }
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
