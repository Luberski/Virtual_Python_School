import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  selectIsLogged,
  selectAuthUser,
} from "../../../features/auth/authSlice";
import {
  fetchCourses,
  selectCoursesData,
} from "../../../features/courses/coursesSlice";

import NavBar from "../../../components/NavBar";

export default function ManageCoursesPage() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const courses = useAppSelector(selectCoursesData);

  // todo: refactor to server side fetching
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchCourses());
    };

    fetchData().catch(console.error);
  }, [dispatch]);

  return (
    <div className="w-full h-full">
      <NavBar
        user={user}
        isLoggedIn={isLoggedIn}
        logout={() =>
          dispatch({
            type: "auth/logout",
          })
        }
      />
      <div className="container px-6 mx-auto">
        <div className="flex flex-row">
          <ul className="p-6 my-6 bg-gray-100 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700">
            <li className="flex items-center justify-between w-full mb-6 menu-btn menu-btn-primary">
              <div className="flex items-center">
                <span className="text-sm">{t("Manage.manage-courses")}</span>
              </div>
            </li>
            <li className="flex items-center justify-between w-full mb-6 menu-btn menu-btn-secondary">
              <div className="flex items-center">
                <span className="text-sm">{t("Manage.manage-lessons")}</span>
              </div>
            </li>
          </ul>
          <div className="flex flex-col p-6 pb-4">
            <h1 className="pb-4">{t("Manage.manage-courses")}</h1>
            <p className="font-medium">{t("Courses.list-of-courses")}</p>
            <div className="w-full my-4">
              <div>
                <table className="table-auto">
                  <thead className="border border-gray-300 g-gray-100 dark:border-gray-600 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-2 text-xs ">ID</th>
                      <th className="px-6 py-2 text-xs ">Name</th>
                      <th className="px-6 py-2 text-xs ">Description</th>
                      <th className="px-6 py-2 text-xs" colSpan={2}>
                        {t("Manage.manage")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses &&
                      courses.length > 0 &&
                      courses.map((course) => (
                        <React.Fragment key={course.id}>
                          <tr className="whitespace-nowrap">
                            <td className="px-6 py-4 text-sm ">{course.id}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm truncate">
                                {course.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm truncate">
                              {course.description}
                            </td>
                            <td className="px-6 py-4">
                              <a href="#" className="menu-btn menu-btn-primary">
                                {t("Manage.edit")}
                              </a>
                            </td>
                            <td className="px-6 py-4">
                              <a href="#" className="menu-btn menu-btn-danger">
                                {t("Manage.delete")}
                              </a>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
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
