import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import {
  AcademicCapIcon,
  BoltIcon,
  CheckBadgeIcon,
  FaceSmileIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ISO6391 from 'iso-639-1';
import Footer from '@app/components/Footer';
import { useAppSelector, useAuthRedirect } from '@app/hooks';
import NavBar from '@app/components/NavBar';
import {
  COURSES_LIMIT,
  LESSONS_LIMIT,
  TAG_COLORS,
  WEBSITE_TITLE,
} from '@app/constants';
import { wrapper } from '@app/store';
import {
  fetchDashboard,
  selectDashboardData,
} from '@app/features/dashboard/dashboardSlice';
import {
  fetchEnrolledCourses,
  selectEnrolledCoursesData,
} from '@app/features/courses/enrolled/enrolledCoursesSlice';
import FancyCard from '@app/components/FancyCard';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import ButtonLink, { ButtonLinkVariant } from '@app/components/ButtonLink';

export default function UserDashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const enrolledCourses = useAppSelector(selectEnrolledCoursesData);

  if (!user && !isLoggedIn) {
    return null;
  }

  const total_my_courses =
    dashboardData?.total_enrolled_courses_count +
      dashboardData?.total_dynamic_courses_count || 0;

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-dashboard')} - {WEBSITE_TITLE}
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
        <div className="brand-shadow2 container my-6 mx-auto flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
          <div className="container mx-auto px-6 pt-6">
            <div className="flex flex-col">
              <div className="flex">
                {dashboardData && (
                  <div className=" flex flex-col">
                    <h3 className="pb-6 text-indigo-900 dark:text-indigo-300">
                      {t('Dashboard.my-stats')}
                    </h3>
                    <div className="brand-shadow2 flex space-x-6 rounded-lg bg-white p-6 shadow-black/25 dark:bg-neutral-700">
                      <div className="flex flex-col items-center justify-center text-purple-500">
                        <AcademicCapIcon className="h-9 w-9" />
                        <div className="text-2xl font-bold">
                          {total_my_courses}
                        </div>
                        <div>{t('Meta.title-enrolled-courses')}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center text-indigo-500">
                        <CheckBadgeIcon className="h-9 w-9" />
                        <div className="text-2xl font-bold">
                          {dashboardData.total_enrolled_lessions_count}
                        </div>
                        <div>{t('Lessons.enrolled-lessons')}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center text-emerald-500">
                        <FaceSmileIcon className="h-9 w-9" />
                        <div className="text-2xl font-bold">
                          {dashboardData.total_completed_lessons_count}
                        </div>
                        <div>{t('Lessons.completed-lessons')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="my-6">
                <div className="flex flex-col">
                  <h3 className="pb-6 text-indigo-900 dark:text-indigo-300">
                    {t('Meta.title-enrolled-courses')}
                  </h3>
                  {enrolledCourses && enrolledCourses.length > 0 && (
                    <div className="flex max-w-sm flex-col items-center space-y-6 py-1 sm:max-w-fit sm:flex-row sm:space-y-0 sm:space-x-4 sm:overflow-x-auto">
                      {enrolledCourses.map((enrolledCourse) => {
                        const lessonsCompletedPercentage =
                          Math.round(
                            (enrolledCourse.total_completed_lessons_count /
                              enrolledCourse.total_lessons_count) *
                              100
                          ) || 0;
                        const intl = new Intl.DisplayNames(router.locale, {
                          type: 'language',
                        });
                        return (
                          <FancyCard
                            key={enrolledCourse.id}
                            title={
                              enrolledCourse.is_dynamic ? (
                                <div className="text-indigo-900 dark:text-indigo-300">
                                  <BoltIcon className="mr-1 mb-1 inline h-5 w-5" />
                                  {t('DynamicCourse.course-name')}
                                </div>
                              ) : (
                                enrolledCourse.name
                              )
                            }
                            description={
                              <div className="flex h-32 flex-col">
                                <div className="flex space-x-2">
                                  <div className="my-2 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700">
                                    <div
                                      className="h-2 rounded-lg bg-indigo-600"
                                      style={{
                                        width: `${lessonsCompletedPercentage}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="text-sm text-neutral-500">
                                    {lessonsCompletedPercentage}%
                                  </div>
                                </div>
                                {enrolledCourse.lang && (
                                  <div className="mb-2 text-sm">
                                    {t('Meta.language')}:&nbsp;
                                    {intl?.of(enrolledCourse.lang).length > 2
                                      ? intl.of(enrolledCourse.lang)
                                      : ISO6391.getName(enrolledCourse.lang)}
                                  </div>
                                )}
                                {enrolledCourse.tags &&
                                  enrolledCourse.tags.length > 0 && (
                                    <div className="mb-2 flex max-h-16 flex-wrap overflow-auto text-sm">
                                      {enrolledCourse.tags.map((tag, index) => (
                                        <div
                                          key={tag.id}
                                          className={`mr-1 mt-1 h-6 w-fit rounded-lg px-3 py-1 text-center text-xs font-semibold ${
                                            TAG_COLORS[
                                              index % TAG_COLORS.length
                                            ]
                                          }`}>
                                          {tag.name}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                <div>{enrolledCourse.description}</div>
                              </div>
                            }
                            cardColor={
                              enrolledCourse.is_dynamic
                                ? 'bg-indigo-50 dark:bg-indigo-400/25'
                                : 'bg-white'
                            }
                            shadowColor={
                              enrolledCourse.is_dynamic
                                ? 'shadow-indigo-900/25'
                                : 'shadow-black/25'
                            }
                            hoverShadowColor="hover:shadow-black/25"
                            bottomControls={
                              <Link
                                href={
                                  enrolledCourse.is_dynamic
                                    ? `/dynamic-courses/${enrolledCourse.id}`
                                    : `/courses/${enrolledCourse.id}`
                                }
                                passHref={true}>
                                <IconButtonLink
                                  variant={
                                    IconButtonLinkVariant.OUTLINE_PRIMARY
                                  }
                                  icon={
                                    <InformationCircleIcon className="h-5 w-5" />
                                  }>
                                  {t('Home.more')}
                                </IconButtonLink>
                              </Link>
                            }
                          />
                        );
                      })}
                      {COURSES_LIMIT < total_my_courses && (
                        <Link href="/courses/enrolled" passHref>
                          <ButtonLink
                            className="lowercase"
                            variant={ButtonLinkVariant.FLAT_PRIMARY}>
                            {total_my_courses - COURSES_LIMIT}
                            &nbsp;{t('Home.more')}
                          </ButtonLink>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale }) => {
      await store.dispatch(fetchDashboard());
      await store.dispatch(
        fetchEnrolledCourses({
          includeLessons: true,
          limitLessons: LESSONS_LIMIT,
          limit: COURSES_LIMIT,
        })
      );

      return {
        props: {
          i18n: Object.assign({}, await import(`../../../i18n/${locale}.json`)),
        },
      };
    }
);
