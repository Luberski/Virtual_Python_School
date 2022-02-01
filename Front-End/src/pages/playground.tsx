import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import Button from "../components/Button";
import NavBar from "../components/NavBar";
import { useTranslations } from "use-intl";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from "../features/playground/playgroundSlice";
import { selectAuthUser, selectIsLogged } from "../features/auth/authSlice";

export default function Playground() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const editorRef = useRef(null);
  const user = useAppSelector(selectAuthUser);
  const isLoggedIn = useAppSelector(selectIsLogged);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);

  const handleEditorDidMount = (editor, _monaco) => {
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
              type: "auth/logout",
            })
          }
        />
        <div className="container flex flex-col items-center justify-center px-6 pb-4 mx-auto my-6">
          <div>
            <h1 className="text-center">{t("Playground.leading")}</h1>
          </div>
        </div>
        <div className="container px-6 mx-auto space-y-4">
          <div className="grid items-center grid-cols-2">
            <Button
              onClick={handleValue}
              className="h-12 my-8 btn-primary w-28"
            >
              {t("Playground.run")}
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
            <div className="w-full mx-auto subpixel-antialiased bg-black border-black rounded shadow-2xl h-96">
              <div
                className="flex items-center h-6 text-center text-black bg-gray-200 border-b border-gray-500 rounded-t dark:bg-gray-800 dark:text-white"
                id="headerTerminal"
              >
                <div className="mx-auto" id="terminaltitle">
                  <p className="text-center">Terminal output</p>
                </div>
              </div>
              <div
                className="h-auto pt-1 pl-1 font-mono text-xs bg-black"
                id="console"
              >
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      i18n: Object.assign({}, await import(`../../i18n/${locale}.json`)),
    },
  };
}
