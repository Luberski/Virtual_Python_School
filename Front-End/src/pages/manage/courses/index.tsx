import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectIsLogged,
  selectAuthUser,
} from '../../../features/auth/authSlice';
import {
  deleteCourse,
  fetchCourses,
  selectCoursesData,
} from '../../../features/courses/coursesSlice';
import NavBar from '../../../components/NavBar';
import Button from '../../../components/Button';
import Image from 'next/image';

export default function ManageCoursesPage() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const courses = useAppSelector(selectCoursesData);

  // TODO: refactor to server side fetching
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchCourses());
    };

    fetchData().catch(console.error);
  }, [dispatch]);

  const handleDeleteCourse = (id: string | number) => async (e) => {
    await dispatch(deleteCourse(id));
  };

  return (
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
      <div className="container px-6">
        <div className="flex flex-row">
          <ul className="p-6 my-6 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
            <li className="flex justify-between items-center mb-6 w-full menu-btn menu-btn-primary">
              <div className="flex items-center">
                <span className="text-sm">{t('Manage.manage-courses')}</span>
              </div>
            </li>
            <li className="flex justify-between items-center mb-6 w-full menu-btn menu-btn-secondary">
              <div className="flex items-center">
                <span className="text-sm">{t('Manage.manage-lessons')}</span>
              </div>
            </li>
          </ul>
          <div className="flex flex-col p-6 pb-4">
            <h1 className="pb-4">{t('Manage.manage-courses')}</h1>
            {courses && courses.length > 0 ? (
              <>
                <p className="text-xl font-medium">
                  {t('Courses.list-of-courses')}
                </p>
                <div className="my-4 w-full">
                  <table className="table-auto">
                    <thead className="dark:bg-gray-700 border border-gray-300 dark:border-gray-600 g-gray-100">
                      <tr>
                        <th className="py-2 px-6 text-xs ">ID</th>
                        <th className="py-2 px-6 text-xs ">Name</th>
                        <th className="py-2 px-6 text-xs ">Description</th>
                        <th className="py-2 px-6 text-xs" colSpan={2}>
                          {t('Manage.manage')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <React.Fragment key={course.id}>
                          <tr className="whitespace-nowrap">
                            <td className="py-4 px-6 text-sm ">{course.id}</td>
                            <td className="py-4 px-6">
                              <div className="text-sm truncate">
                                {course.name}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm truncate">
                              {course.description}
                            </td>
                            <td className="py-4 px-6">
                              <a href="#" className="menu-btn menu-btn-primary">
                                {t('Manage.edit')}
                              </a>
                            </td>
                            <td className="py-4 px-6">
                              <Button
                                className="menu-btn menu-btn-danger"
                                onClick={handleDeleteCourse(course.id)}>
                                {t('Manage.delete')}
                              </Button>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center">
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
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../../../i18n/${locale}.json`)),
    },
  };
}
