import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/outline';
import ConfettiExplosion from 'react-confetti-explosion';
import debounce from 'debounce';
import { PlayIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@app/hooks';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  selectPlaygroundStatus,
  sendCode,
} from '@app/features/playground/playgroundSlice';
import Input from '@app/components/Input';
import {
  checkAnswer,
  reset,
  selectAnswerData,
  selectAnswerStatus,
} from '@app/features/lessons/answerSlice';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import FancyToast from '@app/components/FancyToast';
import type { EnrolledLesson as EnrolledLessonModel } from '@app/models/EnrolledLesson';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

type EnrolledLessonProps = {
  courseId: number;
  lessonId: number;
  enrolledLessonId: number;
  enrolledLesson: EnrolledLessonModel;
  translations: (key: string) => string;
};

export default function EnrolledLesson({
  courseId,
  lessonId,
  enrolledLessonId,
  enrolledLesson,
  translations,
}: EnrolledLessonProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const playgroundStatus = useAppSelector(selectPlaygroundStatus);
  const { register, handleSubmit, setValue } =
    useForm<{
      answer: string;
    }>();
  const answerStatus = useAppSelector(selectAnswerStatus);
  const answerData = useAppSelector(selectAnswerData);
  const [isExploding, setIsExploding] = useState(false);

  const notify = useCallback(
    (isSucces = true) => {
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
              className="border-red-500 bg-red-200 text-red-900"
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
          router.push(`/courses/${courseId}`);
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
  ]);
  const onSubmit = useMemo(
    () =>
      debounce((data: { answer: string }) => {
        const { answer } = data;
        try {
          dispatch(
            checkAnswer({
              lessonId,
              enrolledLessonId,
              answer,
            })
          );
          reset();
        } catch (error) {
          console.error(error);
        }
      }, 500),
    [dispatch, enrolledLessonId, lessonId]
  );

  const handleValue = useMemo(
    () =>
      debounce(() => {
        const value = editorRef.current.getValue();
        try {
          dispatch(sendCode({ content: value }));
          setValue('answer', '');
        } catch (error) {
          console.error(error);
        }
      }, 1000),
    [dispatch, setValue]
  );

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {enrolledLesson ? (
        <>
          <h1 className="pb-4 text-center text-indigo-900 dark:text-indigo-300">
            {translations('Meta.title-lesson')}:&nbsp;{enrolledLesson.name}
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
              {translations('Playground.run')}
            </IconButton>
          </div>

          <div className="flex w-full flex-col xl:flex-row">
            <div className="brand-shadow2 m-2 flex flex-col rounded-lg bg-white p-6 shadow-black/25 dark:bg-neutral-700 xl:w-1/2">
              <h2>{translations('Manage.description')}</h2>
              <p className="h-[580px] overflow-auto whitespace-pre-line">
                {enrolledLesson.description}
              </p>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex w-full flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Input
                  placeholder={translations('Lessons.answer')}
                  label="answer"
                  name="answer"
                  className="w-full"
                  required
                  register={register}
                />
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
            <div className="brand-shadow2 m-2 flex flex-1 flex-col shadow-black/25">
              <Editor
                className="h-96"
                defaultLanguage="python"
                defaultValue=""
                onMount={handleEditorDidMount}
                theme="vs-dark"
              />
              <div>
                <div className="brand-shadow2 mx-auto h-96 rounded-lg border-black bg-black subpixel-antialiased shadow-black/25">
                  <div
                    className="flex h-6 items-center rounded-t border-b border-neutral-500 bg-neutral-200 text-center text-black dark:bg-neutral-800 dark:text-white"
                    id="headerTerminal">
                    <div className="mx-auto" id="terminaltitle">
                      <p className="text-center">Terminal output</p>
                    </div>
                  </div>
                  <div
                    className="font-mono h-auto bg-black pt-1 pl-1 text-xs"
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
          {translations('Lessons.lesson-not-found')}
        </h1>
      )}
    </>
  );
}
