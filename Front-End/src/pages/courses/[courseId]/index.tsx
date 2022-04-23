import { useRouter } from 'next/router';
import NavBar from '../../../components/NavBar';
import { GetStaticPaths } from 'next';
import {
  selectAuthUser,
  selectIsLogged,
} from '../../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';

export default function CoursePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const router = useRouter();
  const { courseId } = router.query;

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

export async function getStaticProps({ locale }: { locale: string }) {
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
    fallback: 'blocking', //indicates the type of fallback
  };
};
