import { useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import NavBar from '../components/NavBar';
import { useTranslations } from 'use-intl';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  selectPlaygroundStatus,
  sendCode,
} from '../features/playground/playgroundSlice';
import { selectAuthUser, selectIsLogged } from '../features/auth/authSlice';
import { WEBSITE_TITLE } from '../constants';
import Head from 'next/head';
import IconButton, { IconButtonVariant } from '../components/IconButton';
import { PlayIcon } from '@heroicons/react/outline';
import Footer from '../components/Footer';
import debounce from 'debounce';

export default function Playground() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const editorRef = useRef(null);
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const playgroundStatus = useAppSelector(selectPlaygroundStatus);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleValue = useMemo(
    () =>
      debounce(() => {
        const value = editorRef.current.getValue();
        try {
          dispatch(sendCode({ content: value }));
        } catch (error) {
          console.error(error);
        }
      }, 1000),
    [dispatch]
  );

  return (
    <>
      <Head>
        <title>
          {t('Meta.title-playground')} - {WEBSITE_TITLE}
        </title>
      </Head>
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
            <h1 className="text-center">{t('Playground.leading')}</h1>
          </div>
        </div>
        <div className="container px-6 mx-auto space-y-4">
          <div className="grid grid-cols-2 items-center">
            <IconButton
              onClick={handleValue}
              className="my-8 max-w-fit h-12"
              variant={IconButtonVariant.PRIMARY}
              icon={
                playgroundStatus === 'pending' ? (
                  <svg
                    className="mr-1 w-5 h-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )
              }>
              {t('Playground.run')}
            </IconButton>
          </div>
        </div>
        <div className="flex px-6">
          <Editor
            className="w-1/2 h-96"
            defaultLanguage="python"
            defaultValue=""
            onMount={handleEditorDidMount}
            theme="vs-dark"
          />
          <div className="w-full">
            <div className="mx-auto w-full h-96 subpixel-antialiased bg-black rounded border-black shadow-2xl">
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
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
    },
  };
}
