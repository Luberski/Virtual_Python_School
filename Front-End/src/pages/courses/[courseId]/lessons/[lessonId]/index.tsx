import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../../components/NavBar';
import { useTranslations } from 'next-intl';
import { GetStaticPaths } from 'next';
import Editor from '@monaco-editor/react';
import {
  useAppDispatch,
  useAppSelector,
  useAuthRedirect,
} from '../../../../../hooks';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from '../../../../../features/playground/playgroundSlice';
import Button, { ButtonVariant } from '../../../../../components/Button';
import {
  fetchLesson,
  selectLessonData,
} from '../../../../../features/lessons/lessonSlice';

export default function LessonPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { courseId, lessonId } = router.query as {
    courseId: string;
    lessonId: string;
  };
  const t = useTranslations();

  const editorRef = useRef(null);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);

  // TODO: refactor to server side fetching
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchLesson({ courseId, lessonId }));
    };

    fetchData().catch(console.error);
  }, [dispatch, isLoggedIn, courseId, lessonId]);

  const lesson = useAppSelector(selectLessonData);

  if (!user && !isLoggedIn) {
    return null;
  }

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleValue = async () => {
    const value = editorRef.current.getValue();
    try {
      await dispatch(sendCode({ content: value }));
    } catch (error) {
      console.error(error);
    }
  };

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
          {lesson ? (
            <>
              <h1 className="text-center first-letter:uppercase">
                {t('Meta.title-lesson')}:&nbsp;{lesson.name}
              </h1>
              <Button
                onClick={handleValue}
                variant={ButtonVariant.PRIMARY}
                className="my-8 w-28 h-12">
                {t('Playground.run')}
              </Button>
              <div className="flex flex-col w-full xl:flex-row">
                <div className="flex flex-col p-8 m-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl xl:w-1/2">
                  <h2>{t('Lessons.lesson-description')}</h2>
                  <p className='whitespace-pre-line'>{lesson.description}</p>
                </div>
                <div className="flex flex-col flex-1 m-2 shadow-xl">
                  <Editor
                    className="h-96"
                    defaultLanguage="python"
                    defaultValue=""
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                  />
                  <div>
                    <div className="mx-auto h-96 subpixel-antialiased bg-black rounded border-black shadow-2xl">
                      <div
                        className="flex items-center h-6 text-center text-black dark:text-white bg-gray-200 dark:bg-gray-800 rounded-t border-b border-gray-500"
                        id="headerTerminal">
                        <div className="mx-auto" id="terminaltitle">
                          <p className="text-center">Terminal output</p>
                        </div>
                      </div>
                      <div
                        className="pt-1 pl-1 h-auto text-xs bg-black font-mono"
                        id="console">
                        <pre className="pb-1 text-white">
                          {playgroundData?.content || playgroundError}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <h1 className="text-center first-letter:uppercase">
              {t('Lessons.lesson-not-found')}
            </h1>
          )}
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      i18n: Object.assign(
        {},
        await import(`../../../../../../i18n/${locale}.json`)
      ),
    },
  };
}

export const getStaticPaths: GetStaticPaths<{
  lessonId: string;
}> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking', //indicates the type of fallback
  };
};
