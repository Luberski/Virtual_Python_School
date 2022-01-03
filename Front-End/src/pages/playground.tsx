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

export default function Playground() {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const editorRef = useRef(null);

  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);

  const handleEditorDidMount = (editor, _monaco) => {
    editorRef.current = editor;
  };

  const handleValue = async () => {
    const value = editorRef.current.getValue();
    try {
      await dispatch(sendCode({ content: value })).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="absolute w-full h-full">
        <NavBar />
        <div className="container flex flex-col justify-center items-center px-6 pb-4 mx-auto my-6">
          <div>
            <h1 className="text-center">{t("Playground.leading")}</h1>
          </div>
        </div>
        <div className="container mx-auto px-6 space-y-4">
          <div className="grid grid-cols-2 items-center">
            <Button
              onClick={handleValue}
              className="btn-primary w-28 h-12 my-8"
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
            <div className="w-full shadow-2xl subpixel-antialiased rounded h-96 bg-black border-black mx-auto">
              <div
                className="flex items-center h-6 rounded-t bg-gray-200 dark:bg-gray-800 border-b border-gray-500 text-center text-black dark:text-white"
                id="headerTerminal"
              >
                <div className="mx-auto" id="terminaltitle">
                  <p className="text-center">Terminal output</p>
                </div>
              </div>
              <div
                className="pl-1 pt-1 h-auto  font-mono text-xs bg-black"
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
