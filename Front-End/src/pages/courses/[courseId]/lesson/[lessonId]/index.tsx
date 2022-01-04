import React, { useRef } from "react";
import { useRouter } from "next/router";
import NavBar from "../../../../../components/NavBar";
import { useTranslations } from "next-intl";
import { GetStaticPaths } from "next";
import Editor from "@monaco-editor/react";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from "../../../../../features/playground/playgroundSlice";
import Button from "../../../../../components/Button";

export default function LessonPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { lessonId } = router.query;
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
        <div className="container flex flex-col items-center justify-center px-6 pb-4 mx-auto my-6">
          <h1 className="text-center first-letter:uppercase">
            {lessonId} lesson page
          </h1>
          <Button onClick={handleValue} className="h-12 my-8 btn-primary w-28">
            {t("Playground.run")}
          </Button>
          <div className="flex flex-col w-full xl:flex-row">
            <div className="flex flex-col p-8 m-2 bg-gray-200 shadow-xl rounded-xl xl:w-1/2 dark:bg-gray-800">
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
                <div className="mx-auto subpixel-antialiased bg-black border-black rounded shadow-2xl h-96">
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

export const getStaticPaths: GetStaticPaths<{ lessonId: string }> =
  async () => {
    return {
      paths: [], //indicates that no page needs be created at build time
      fallback: "blocking", //indicates the type of fallback
    };
  };
