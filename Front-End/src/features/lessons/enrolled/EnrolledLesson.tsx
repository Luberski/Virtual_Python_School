import 'highlight.js/styles/vs2015.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import ConfettiExplosion from 'react-confetti-explosion';
import debounce from 'debounce';
import { useDispatch } from 'react-redux';
import { PlayIcon, CheckIcon } from '@heroicons/react/20/solid';
import { useTheme } from 'next-themes';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  selectPlaygroundStatus,
  sendCode,
} from '@app/features/playground/playgroundSlice';
import {
  checkAnswer,
  reset,
  selectAnswerData,
  selectAnswerStatus,
} from '@app/features/lessons/answerSlice';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import FancyToast, { FancyToastVariant } from '@app/components/FancyToast';
import type EnrolledLessonModel from '@app/models/EnrolledLesson';
import { useAppSelector, useMarkdown } from '@app/hooks';
import type KnowledgeTest from '@app/models/KnowledgeTest';
import KnowledgeTestForm from '@app/features/dynamic-courses/knowledge-test/KnowledgeTestForm';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

type Props = {
  translations: (key: string, ...params: unknown[]) => string;
  courseId: string;
  lessonId: string;
  enrolledLessonId: string;
  enrolledLesson: EnrolledLessonModel;
  isDynamic?: boolean;
  knowledgeTest?: KnowledgeTest;
};

export default function EnrolledLesson({
  translations,
  courseId,
  lessonId,
  enrolledLessonId,
  enrolledLesson,
  isDynamic,
  knowledgeTest,
}: Props) {
  const dispatch = useDispatch();
  const router = useRouter();
  const editorRef = useRef(null);

  const { handleSubmit } = useForm();
  const [isExploding, setIsExploding] = useState(false);
  const answerStatus = useAppSelector(selectAnswerStatus);
  const answerData = useAppSelector(selectAnswerData);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const playgroundStatus = useAppSelector(selectPlaygroundStatus);
  const [showKnowledgeTest, setShowKnowledgeTest] = useState(false);
  const parsedLessonDescription = useMarkdown(enrolledLesson?.description);
  const { theme } = useTheme();

  const notify = useCallback(
    (isSucces: boolean) => {
      if (isSucces) {
        return toast.custom(
          (to) => (
            <FancyToast
              message={translations('Lessons.correct-answer')}
              toastObject={to}
            />
          ),
          { position: 'top-center', duration: 500 }
        );
      } else {
        return toast.custom(
          (to) => (
            <FancyToast
              message={translations('Lessons.incorrect-answer')}
              toastObject={to}
              variant={FancyToastVariant.ERROR}
            />
          ),
          { position: 'top-center', duration: 500 }
        );
      }
    },
    [translations]
  );

  useEffect(() => {
    if (answerStatus === 'succeeded') {
      if (answerData?.status === true) {
        notify(true);
        setIsExploding(true);
        setTimeout(() => {
          setIsExploding(false);
          if (knowledgeTest) {
            setShowKnowledgeTest(true);
          } else {
            if (isDynamic) {
              router.push(`/dynamic-courses/${courseId}`);
            } else {
              router.push(`/courses/${courseId}`);
            }
          }
        }, 2000);
      } else {
        notify(false);
      }
    }
    return () => {
      dispatch(reset());
    };
  }, [
    dispatch,
    answerData,
    answerStatus,
    lessonId,
    router,
    isExploding,
    notify,
    courseId,
    isDynamic,
    knowledgeTest,
  ]);

  const onSubmit = useMemo(
    () =>
      debounce(() => {
        const answer = playgroundData?.content || '';
        try {
          dispatch(
            checkAnswer({
              lessonId: Number(lessonId),
              enrolledLessonId: Number(enrolledLessonId),
              isDynamic,
              answer,
            })
          );
          reset();
        } catch (error) {
          console.error(error);
        }
      }, 500),
    [dispatch, enrolledLessonId, isDynamic, lessonId, playgroundData?.content]
  );

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

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  return (
    <>
      {enrolledLesson ? (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {showKnowledgeTest ? (
            <>
              <h1 className="pb-6 text-center text-indigo-900 dark:text-indigo-300">
                {translations('KnowledgeTest.leading')}
              </h1>
              <KnowledgeTestForm
                knowledgeTest={knowledgeTest}
                translations={translations}
              />
            </>
          ) : (
            <>
              <div className="my-1 self-end">
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
                  {translations('Playground.run')}
                </IconButton>
              </div>

              <div className="flex w-full flex-col xl:flex-row">
                <div className="brand-shadow2 m-2 flex flex-col rounded-lg bg-white p-6 shadow-black/25 dark:bg-neutral-700 xl:w-1/2">
                  {parsedLessonDescription && (
                    <div
                      className="markdown h-[656px] overflow-auto whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: parsedLessonDescription,
                      }}
                    />
                  )}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-3 flex w-full justify-end">
                    <IconButton
                      variant={IconButtonVariant.PRIMARY}
                      type="submit"
                      icon={
                        answerStatus === 'pending' ? (
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
                          <CheckIcon className="h-5 w-5" />
                        )
                      }>
                      {translations('Lessons.check-answer')}
                    </IconButton>
                    {isExploding && (
                      <ConfettiExplosion
                        duration={1500}
                        floorHeight={200}
                        floorWidth={600}
                        force={0.4}
                        particleCount={100}
                      />
                    )}
                  </form>
                </div>
                <div className="brand-shadow2 m-2 flex flex-1 flex-col rounded-lg shadow-black/25">
                  <Editor
                    className="h-96 p-1"
                    defaultLanguage="python"
                    defaultValue=""
                    options={{
                      lineNumbersMinChars: 2,
                      minimap: {
                        enabled: false,
                      },
                    }}
                    onMount={handleEditorDidMount}
                    theme={theme === 'light' ? 'vs' : 'vs-dark'}
                  />
                  <div>
                    <div className="mx-auto h-96 rounded-lg bg-white dark:bg-black">
                      <div
                        className="flex h-6 items-center border-b border-neutral-500 bg-neutral-100 text-center text-black dark:bg-neutral-800 dark:text-white"
                        id="headerTerminal">
                        <div className="mx-auto" id="terminaltitle">
                          <p className="text-center">
                            {translations('Playground.console')}
                          </p>
                        </div>
                      </div>
                      <div
                        className="font-mono h-auto pt-1 pl-1 text-sm"
                        id="console">
                        <pre className="pb-1">
                          {playgroundData?.content || playgroundError}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <h1 className="text-center first-letter:uppercase">
          {translations('Lessons.lesson-not-found')}
        </h1>
      )}
      <Toaster />
    </>
  );
}
