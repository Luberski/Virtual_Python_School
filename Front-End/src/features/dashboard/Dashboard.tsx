import {
  AcademicCapIcon,
  BoltIcon,
  CheckBadgeIcon,
  FaceFrownIcon,
  FaceSmileIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ISO6391 from 'iso-639-1';
import { COURSES_LIMIT, TAG_COLORS } from '@app/constants';
import FancyCard from '@app/components/FancyCard';
import IconButtonLink, {
  IconButtonLinkVariant,
} from '@app/components/IconButtonLink';
import ButtonLink, { ButtonLinkVariant } from '@app/components/ButtonLink';
import Alert from '@app/components/Alert';
import type EnrolledCourse from '@app/models/EnrolledCourse';
import type DashboardModel from '@app/models/Dashboard';
import type Course from '@app/models/Course';
import type Lesson from '@app/models/Lesson';

type DashboardProps = {
  dashboardData: DashboardModel;
  enrolledCourses: EnrolledCourse[];
  recommendedCoursesData: Course[];
  recommendedLessonsData: Lesson[];
  translations: (key: string, ...params: unknown[]) => string;
};

export default function Dashboard({
  dashboardData,
  enrolledCourses,
  recommendedCoursesData,
  recommendedLessonsData,
  translations,
}: DashboardProps) {
  const router = useRouter();

  const total_my_courses =
    dashboardData?.total_enrolled_courses_count +
      dashboardData?.total_dynamic_courses_count || 0;

  return (
    <div className="flex flex-col">
      {dashboardData && (
        <div className="flex flex-col">
          <h3 className="pb-6 text-indigo-900 dark:text-indigo-300">
            {translations('Dashboard.my-stats')}
          </h3>
          <div className="flex flex-col space-y-6 sm:flex-row sm:space-x-6 sm:space-y-0">
            <div className="flex flex-col">
              <div className="brand-shadow2 flex space-x-6 rounded-lg bg-white p-6 shadow-black/25 dark:bg-neutral-700">
                <div className="flex flex-col items-center justify-center text-purple-500">
                  <AcademicCapIcon className="h-9 w-9" />
                  <div className="text-2xl font-bold">{total_my_courses}</div>
                  <div>{translations('Meta.title-enrolled-courses')}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-indigo-500">
                  <CheckBadgeIcon className="h-9 w-9" />
                  <div className="text-2xl font-bold">
                    {dashboardData.total_enrolled_lessions_count}
                  </div>
                  <div>{translations('Lessons.enrolled-lessons')}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-emerald-500">
                  <FaceSmileIcon className="h-9 w-9" />
                  <div className="text-2xl font-bold">
                    {dashboardData.total_completed_lessons_count}
                  </div>
                  <div>{translations('Lessons.completed-lessons')}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="brand-shadow2 flex space-x-6 rounded-lg bg-white p-6 shadow-black/25 dark:bg-neutral-700">
                <div className="flex flex-col items-center justify-center text-blue-500">
                  <InformationCircleIcon className="h-9 w-9" />
                  <div className="text-2xl font-bold">
                    {dashboardData.total_number_of_answers}
                  </div>
                  <div>{translations('Lessons.all-answers')}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-emerald-500">
                  <FaceSmileIcon className="h-9 w-9" />
                  <div className="text-2xl font-bold">
                    {dashboardData.total_number_of_correct_answers}
                  </div>
                  <div>{translations('Lessons.all-correct-answers')}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-red-500">
                  <FaceFrownIcon className="h-9 w-9" />
                  <div className="text-2xl font-bold">
                    {dashboardData.total_number_of_incorrect_answers}
                  </div>
                  <div>{translations('Lessons.all-incorrect-answers')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {recommendedLessonsData && recommendedLessonsData.length > 0 && (
        <div className="my-6">
          <div className="flex flex-col">
            <h3 className="text-indigo-900 dark:text-indigo-300">
              {translations('Meta.reminders')}
            </h3>
            <Alert className="my-6">
              <InformationCircleIcon className="mr-2 h-6 w-6 " />
              <p className="w-fit max-w-xs">
                {translations('Lessons.recommended-lessons-to-retry-info')}
              </p>
            </Alert>
            <div className="flex max-w-sm flex-col items-center space-y-6 py-1 sm:max-w-fit sm:flex-row sm:space-y-0 sm:space-x-4 sm:overflow-x-auto">
              {recommendedLessonsData.map((recommendedLesson) => {
                return (
                  <FancyCard
                    key={recommendedLesson.id}
                    title={recommendedLesson.name}
                    description={recommendedLesson.description}
                    cardColor={'bg-white'}
                    shadowColor={'shadow-black/25'}
                    hoverShadowColor="hover:shadow-black/25"
                    bottomControls={
                      <Link
                        href={`/courses/${recommendedLesson.course_id}`}
                        passHref={true}>
                        <IconButtonLink
                          variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                          icon={<InformationCircleIcon className="h-5 w-5" />}>
                          {translations('Home.more')}
                        </IconButtonLink>
                      </Link>
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
      {enrolledCourses && enrolledCourses.length > 0 && (
        <div className="my-6">
          <div className="flex flex-col">
            <h3 className="pb-6 text-indigo-900 dark:text-indigo-300">
              {translations('Meta.title-enrolled-courses')}
            </h3>
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
                          {translations('DynamicCourse.course-name')}
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
                            {translations('Meta.language')}:&nbsp;
                            {intl?.of(enrolledCourse.lang).length > 2
                              ? intl.of(enrolledCourse.lang)
                              : ISO6391.getName(enrolledCourse.lang)}
                          </div>
                        )}
                        {enrolledCourse.tags && enrolledCourse.tags.length > 0 && (
                          <div className="mb-2 flex max-h-16 flex-wrap overflow-auto text-sm">
                            {enrolledCourse.tags.map((tag, index) => (
                              <div
                                key={tag.id}
                                className={`mr-1 mt-1 h-6 w-fit rounded-lg px-3 py-1 text-center text-xs font-semibold ${
                                  TAG_COLORS[index % TAG_COLORS.length]
                                }`}>
                                {tag.name}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="truncate">
                          {enrolledCourse.description}
                        </div>
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
                          variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                          icon={<InformationCircleIcon className="h-5 w-5" />}>
                          {translations('Home.more')}
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
                    &nbsp;{translations('Home.more')}
                  </ButtonLink>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      {recommendedCoursesData && recommendedCoursesData.length > 0 && (
        <div className="my-6">
          <div className="flex flex-col">
            <h3 className="pb-6 text-indigo-900 dark:text-indigo-300">
              {translations('Courses.recommended-courses')}
            </h3>
            <div className="flex max-w-sm flex-col items-center space-y-6 py-1 sm:max-w-fit sm:flex-row sm:space-y-0 sm:space-x-4 sm:overflow-x-auto">
              {recommendedCoursesData.map((recommendedCourse) => {
                const intl = new Intl.DisplayNames(router.locale, {
                  type: 'language',
                });
                return (
                  <FancyCard
                    key={recommendedCourse.id}
                    title={recommendedCourse.name}
                    description={
                      <div className="flex h-32 flex-col">
                        {recommendedCourse.lang && (
                          <div className="mb-2 text-sm">
                            {translations('Meta.language')}:&nbsp;
                            {intl?.of(recommendedCourse.lang).length > 2
                              ? intl.of(recommendedCourse.lang)
                              : ISO6391.getName(recommendedCourse.lang)}
                          </div>
                        )}
                        {recommendedCourse.tags &&
                          recommendedCourse.tags.length > 0 && (
                            <div className="mb-2 flex max-h-16 flex-wrap overflow-auto text-sm">
                              {recommendedCourse.tags.map((tag, index) => (
                                <div
                                  key={tag.id}
                                  className={`mr-1 mt-1 h-6 w-fit rounded-lg px-3 py-1 text-center text-xs font-semibold ${
                                    TAG_COLORS[index % TAG_COLORS.length]
                                  }`}>
                                  {tag.name}
                                </div>
                              ))}
                            </div>
                          )}
                        <div>{recommendedCourse.description}</div>
                      </div>
                    }
                    cardColor={'bg-white'}
                    shadowColor={'shadow-black/25'}
                    hoverShadowColor="hover:shadow-black/25"
                    bottomControls={
                      <Link
                        href={`/courses/${recommendedCourse.id}`}
                        passHref={true}>
                        <IconButtonLink
                          variant={IconButtonLinkVariant.OUTLINE_PRIMARY}
                          icon={<InformationCircleIcon className="h-5 w-5" />}>
                          {translations('Home.more')}
                        </IconButtonLink>
                      </Link>
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
