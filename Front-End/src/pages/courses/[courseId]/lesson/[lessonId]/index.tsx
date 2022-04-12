import { useRef } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../../components/NavBar';
import { useTranslations } from 'next-intl';
import { GetStaticPaths } from 'next';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from '../../../../../features/playground/playgroundSlice';
import Button, { ButtonVariant } from '../../../../../components/Button';
import {
  selectAuthUser,
  selectIsLogged,
} from '../../../../../features/auth/authSlice';

export default function LessonPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { lessonId } = router.query;
  const t = useTranslations();

  const editorRef = useRef(null);
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);

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
          <h1 className="text-center first-letter:uppercase">
            {lessonId} lesson page
          </h1>
          <Button
            onClick={handleValue}
            variant={ButtonVariant.PRIMARY}
            className="my-8 w-28 h-12">
            {t('Playground.run')}
          </Button>
          <div className="flex flex-col w-full xl:flex-row">
            <div className="flex flex-col p-8 m-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl xl:w-1/2">
              <h2>Intro</h2>
              <p>
                Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
                Lorem ipsumLorem ipsum Lorem ipsumLorem ipsum Lorem ipsumLorem
                ipsum Lorem ipsumLorem ipsum Lorem ipsumLorem ipsum Lorem
                ipsumLorem ipsum Lorem ipsumLorem ipsum Lorem ipsumLorem ipsum
                Lorem ipsumLorem ipsum Lorem ipsumLorem ipsum Lorem ipsumLorem
                ipsum Lorem ipsumLorem ipsum Lorem ipsumLorem ipsum Lorem
                ipsumLorem ipsum Lorem ipsumLorem ipsum Lorem ipsum
              </p>
              <h2>Instructions</h2>
              <p>Change text “Hello world” to your name.</p>
            </div>
            <div className="flex flex-col flex-1 m-2 shadow-xl">
              <Editor
                className="h-96"
                defaultLanguage="python"
                defaultValue="print('Hello world')"
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
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ locale }) {
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
