import { useMemo, useRef } from 'react';
import { useTranslations } from 'use-intl';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { PlayIcon } from '@heroicons/react/20/solid';
import debounce from 'debounce';
import { useDispatch } from 'react-redux';
import NavBar from '@app/components/NavBar';
import { useAppSelector } from '@app/hooks';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  selectPlaygroundStatus,
  sendCode,
} from '@app/features/playground/playgroundSlice';
import { selectAuthUser, selectIsLogged } from '@app/features/auth/authSlice';
import { WEBSITE_TITLE } from '@app/constants';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import Footer from '@app/components/Footer';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

export default function Playground() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const editorRef = useRef(null);
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const playgroundStatus = useAppSelector(selectPlaygroundStatus);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

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
        <div className="container mx-auto px-4">
          <div className="brand-shadow2 container my-6 flex flex-col items-center justify-center rounded-lg bg-white p-9 shadow-black/25 dark:bg-neutral-800">
            <h1 className="pb-6 text-center text-indigo-900 dark:text-indigo-300">
              {t('Playground.leading')}
            </h1>
            <div className="my-9 self-end">
              <IconButton
                onClick={handleValue}
                variant={IconButtonVariant.PRIMARY}
                icon={
                  playgroundStatus === 'pending' ? (
                    <svg
                      className="mr-1 h-5 w-5 animate-spin"
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
                    <PlayIcon className="h-5 w-5" />
                  )
                }>
                {t('Playground.run')}
              </IconButton>
            </div>
            <div className="flex w-full">
              <Editor
                className="h-96 w-1/2"
                defaultLanguage="python"
                defaultValue=""
                onMount={handleEditorDidMount}
                theme="vs-dark"
              />
              <div className="w-full">
                <div className="mx-auto h-96 w-full rounded border-black bg-black subpixel-antialiased shadow-2xl">
                  <div
                    className="flex h-6 items-center rounded-t border-b border-neutral-500 bg-neutral-200 text-center text-black dark:bg-neutral-800 dark:text-white"
                    id="headerTerminal">
                    <div className="mx-auto" id="terminaltitle">
                      <p className="text-center">Terminal output</p>
                    </div>
                  </div>
                  <div
                    className="h-auto bg-black pt-1 pl-1 font-mono text-xs"
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
