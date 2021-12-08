import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import Button from "../components/Button";
import NavBar from "../components/NavBar";
import { useTranslations } from "use-intl";

export default function Playground() {
  const t = useTranslations();
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, _monaco) => {
    editorRef.current = editor;
  };

  const handleValue = () => {
    console.log(editorRef.current.getValue());
  };

  return (
    <>
      <div className="absolute w-full h-full bg-white">
        <NavBar />
        <div className="container flex flex-col justify-center px-6 pb-4 mx-auto my-6 lg:my-12 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-5xl font-bold text-center text-gray-900">
              {t("Playground.leading")}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-6 space-y-4">
          <Button onClick={handleValue} primary>
            {t("Playground.run")}
          </Button>
          <Editor
            height="90vh"
            defaultLanguage="python"
            defaultValue="# play with code"
            onMount={handleEditorDidMount}
            theme="vs-dark"
          />
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
