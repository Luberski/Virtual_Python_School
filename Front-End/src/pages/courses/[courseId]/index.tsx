import React from "react";
import { useRouter } from "next/router";
import NavBar from "../../../components/NavBar";
import { GetStaticPaths } from "next";
import { selectAuthUser, selectIsLogged } from "../../../features/auth/authSlice";
import { useAppSelector } from "../../../hooks";

export default function CoursePage() {
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const router = useRouter();
  const { courseId } = router.query;

  return (
    <>
      <div className="absolute w-full h-full">
        <NavBar user={user} isLoggedIn={isLoggedIn} />
        <div className="container flex flex-col items-center justify-center px-6 pb-4 mx-auto my-6">
          <div>
            <h1 className="text-center first-letter:uppercase">
              {courseId} course page
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../../../i18n/${locale}.json`)),
    },
  };
}

export const getStaticPaths: GetStaticPaths<{
  courseId: string;
}> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};
