import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import Button, { ButtonVariant } from '../components/Button';
import NavBar from '../components/NavBar';
import { useTranslations } from 'use-intl';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from '../features/playground/playgroundSlice';
import { selectAuthUser, selectIsLogged } from '../features/auth/authSlice';
import { WEBSITE_TITLE } from '../constants';
import Head from 'next/head';

export default function Playground() {
  const dispatch = useAppDispatch();
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
            <Button
              onClick={handleValue}
              variant={ButtonVariant.PRIMARY}
              className="my-8 w-28 h-12">
              {t('Playground.run')}
            </Button>
          </div>
        </div>
        <div className="flex px-6">
          <Editor
            className="w-1/2 h-96"
            defaultLanguage="python"
            defaultValue="# play with code"
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
