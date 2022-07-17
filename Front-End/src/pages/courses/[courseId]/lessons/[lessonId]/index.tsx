import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import Editor from '@monaco-editor/react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/outline';
import ConfettiExplosion from 'react-confetti-explosion';
import debounce from 'debounce';
import { useDispatch } from 'react-redux';
import NavBar from '../../../../../components/NavBar';
import { useAppSelector, useAuthRedirect } from '../../../../../hooks';
import {
  selectPlaygroundData,
  selectPlaygroundError,
  sendCode,
} from '../../../../../features/playground/playgroundSlice';
import Button, { ButtonVariant } from '../../../../../components/Button';
import {
  fetchLesson,
  selectLessonData,
} from '../../../../../features/lessons/lessonSlice';
import Input from '../../../../../components/Input';
import {
  checkAnswer,
  reset,
  selectAnswerData,
  selectAnswerStatus,
} from '../../../../../features/lessons/answerSlice';
import IconButton, {
  IconButtonVariant,
} from '../../../../../components/IconButton';
import Footer from '../../../../../components/Footer';
import { wrapper } from '../../../../../store';
import FancyToast from '../../../../../components/FancyToast';

type Props = {
  courseId: string;
  lessonId: string;
};

export default function LessonPage({ courseId, lessonId }: Props) {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useDispatch();
  const router = useRouter();
  const t = useTranslations();

  const editorRef = useRef(null);
  const playgroundData = useAppSelector(selectPlaygroundData);
  const playgroundError = useAppSelector(selectPlaygroundError);
  const { register, handleSubmit, setValue } =
    useForm<{
      answer: string;
    }>();
  const lesson = useAppSelector(selectLessonData);
  const answerStatus = useAppSelector(selectAnswerStatus);
  const answerData = useAppSelector(selectAnswerData);
  const [isExploding, setIsExploding] = useState(false);

  const notify = useCallback(
    (isSucces = true) => {
      if (isSucces) {
        return toast.custom(
          (to) => (
            <FancyToast
              message={t('Lessons.correct-answer')}
              toastObject={to}
            />
          ),
          { position: 'top-center', duration: 500 }
        );
      } else {
        return toast.custom(
          (to) => (
            <FancyToast
              message={t('Lessons.incorrect-answer')}
              toastObject={to}
              className="border-red-500 bg-red-200 text-red-900"
            />
          ),
          { position: 'top-center', duration: 500 }
        );
      }
    },
    [t]
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
        console.log('wrong answer');
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
    courseId,
    lessonId,
    router,
    isExploding,
    notify,
  ]);

  const onSubmit = useMemo(
    () =>
      debounce((data: { answer: string }) => {
        const { answer } = data;
        try {
          dispatch(
            checkAnswer({
              lessonId,
              answer,
            })
          );
          reset();
        } catch (error) {
          console.error(error);
        }
      }, 500),
    [dispatch, lessonId]
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

  if (!user && !isLoggedIn) {
    return null;
  }

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <>
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

        <div className="container my-6 mx-auto flex flex-col items-center justify-center px-6 pb-4">
          {lesson ? (
            <>
              <h1 className="text-center first-letter:uppercase">
                {t('Meta.title-lesson')}:&nbsp;{lesson.name}
              </h1>
              <div className="space-x-4">
                <Button
                  onClick={handleValue}
                  variant={ButtonVariant.PRIMARY}
                  className="my-8">
                  {t('Playground.run')}
                </Button>
              </div>

              <div className="flex w-full flex-col xl:flex-row">
                <div className="m-2 flex flex-col rounded-lg bg-gray-200 p-8 shadow-xl dark:bg-gray-800 xl:w-1/2">
                  <h2>{t('Lessons.lesson-description')}</h2>
                  <p className="h-[580px] overflow-auto whitespace-pre-line">
                    {lesson.description}
                  </p>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex w-full flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Input
                      placeholder={t('Lessons.answer')}
                      label="answer"
                      name="answer"
                      className="w-full"
                      required
                      register={register}
                    />
                    <IconButton
                      variant={IconButtonVariant.SUCCESS}
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
                      {t('Lessons.check-answer')}
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
                <div className="m-2 flex flex-1 flex-col shadow-xl">
                  <Editor
                    className="h-96"
                    defaultLanguage="python"
                    defaultValue=""
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                  />
                  <div>
                    <div className="mx-auto h-96 rounded border-black bg-black subpixel-antialiased shadow-2xl">
                      <div
                        className="flex h-6 items-center rounded-t border-b border-gray-500 bg-gray-200 text-center text-black dark:bg-gray-800 dark:text-white"
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
              {t('Lessons.lesson-not-found')}
            </h1>
          )}
        </div>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ locale, params }) => {
      const { courseId, lessonId } = params as {
        courseId: string;
        lessonId: string;
      };
      await store.dispatch(fetchLesson({ courseId, lessonId }));

      return {
        props: {
          courseId,
          lessonId,
          i18n: Object.assign(
            {},
            await import(`../../../../../../i18n/${locale}.json`)
          ),
        },
      };
    }
);
