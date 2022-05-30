import NavBar from '../../../components/NavBar';
import {
  useAppDispatch,
  useAppSelector,
  useAuthRedirect,
} from '../../../hooks';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import {
  selectCourseData,
  fetchCourseWithLessons,
} from '../../../features/courses/courseSlice';
import Image from 'next/image';
import Link from 'next/link';
import ButtonLink, { ButtonLinkVariant } from '../../../components/ButtonLink';
import { wrapper } from '../../../store';

export default function CoursePage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const course = useAppSelector(selectCourseData);

  if (!user && !isLoggedIn) {
    return null;
  }

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
          {course ? (
            <div>
              <h1 className="text-center first-letter:uppercase">
                {t('Meta.title-course')}:&nbsp;{course.name}
              </h1>
              <p className="leading-relaxed word-wrap">{course.description}</p>
              {course?.lessons && course?.lessons.length > 0 ? (
                <>
                  <div className="overflow-auto my-6 mx-auto w-fit rounded-lg border border-gray-300 dark:border-gray-600">
                    <table className="divide-y divide-gray-200 table-auto">
                      <thead className="font-medium text-left text-gray-500 uppercase">
                        <tr>
                          <th scope="col" className="py-3 px-4">
                            ID
                          </th>
                          <th scope="col" className="py-3 px-4">
                            {t('Lessons.lesson-name')}
                          </th>
                          <th
                            scope="col"
                            className="py-3 px-4 text-center"
                            colSpan={2}>
                            {t('Manage.manage')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {course?.lessons.map((lesson) => (
                          <Fragment key={lesson.id}>
                            <tr>
                              <td className="p-4">{lesson.id}</td>
                              <td className="p-4 max-w-xs break-words">
                                {lesson.name}
                              </td>
                              <td className="p-4">
                                <Link
                                  href={`/courses/${course.id}/lessons/${lesson.id}`}
                                  passHref={true}>
                                  <ButtonLink
                                    variant={ButtonLinkVariant.SECONDARY}
                                    className="menu-btn menu-btn-primary">
                                    {t('Lessons.join-lesson')}
                                  </ButtonLink>
                                </Link>
                              </td>
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-center">
                  <p className="pb-8 text-lg font-medium">
                    {t('Lessons.no-lessons-found')}
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
          ) : (
            <div>
              <h1 className="text-center first-letter:uppercase">
                {t('Courses.course-not-found')}
              </h1>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { courseId } = params as {
        courseId: string;
      };
      await store.dispatch(fetchCourseWithLessons(courseId));

      return {
        props: {
          courseId,
          i18n: Object.assign(
            {},
            await import(`../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
