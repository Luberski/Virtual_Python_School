import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../../components/NavBar';
import { useTranslations } from 'next-intl';
import { GetStaticPaths } from 'next';
import Editor from '@monaco-editor/react';
import {
  useAppDispatch,
  useAppSelector,
  useAuthRedirect,
} from '../../../../../hooks';
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
import { useForm } from 'react-hook-form';
import {
  checkAnswer,
  reset,
  selectAnswerData,
  selectAnswerStatus,
} from '../../../../../features/lessons/answerSlice';
import toast, { Toaster } from 'react-hot-toast';
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/outline';
import clsx from 'clsx';
import IconButton, {
  IconButtonVariant,
} from '../../../../../components/IconButton';
import ConfettiExplosion from 'react-confetti-explosion';
import Footer from '../../../../../components/Footer';

export default function LessonPage() {
  const [user, isLoggedIn] = useAuthRedirect();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { courseId, lessonId } = router.query as {
    courseId: string;
    lessonId: string;
  };
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

  // TODO: refactor to server side fetching
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchLesson({ courseId, lessonId }));
    };

    fetchData().catch(console.error);
  }, [dispatch, isLoggedIn, courseId, lessonId]);

  useEffect(() => {
    if (answerStatus === 'succeeded') {
      if (answerData?.status === true) {
        notify(true);
        setIsExploding(true);
        setTimeout(() => {
          setIsExploding(false);
          router.push(`/courses/${courseId}`);
        }, 3000);
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
  ]);

  if (!user && !isLoggedIn) {
    return null;
  }

  // TODO: move to component
  const notify = (isSucces = true) =>
    toast.custom(
      (to) => (
        <>
          {isSucces ? (
            <div
              className={clsx(
                to.visible ? 'animate-enter' : 'animate-leave',
                'py-3 px-4 text-emerald-900 bg-emerald-200 rounded-lg border-emerald-500 shadow'
              )}
              role="alert"
              onClick={() => toast.dismiss(to.id)}>
              <div className="flex justify-center space-x-1">
                <InformationCircleIcon className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-bold">Correct answer!</p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                to.visible ? 'animate-enter' : 'animate-leave',
                'py-3 px-4 text-red-900 bg-red-200 rounded-lg border-red-500 shadow'
              )}
              role="alert"
              onClick={() => toast.dismiss(to.id)}>
              <div className="flex justify-center space-x-1">
                <InformationCircleIcon className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-bold">Wrong answer!</p>
                </div>
              </div>
            </div>
          )}
        </>
      ),
      { id: 'unique-notification', position: 'top-center', duration: 500 }
    );

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleValue = async () => {
    const value = editorRef.current.getValue();
    try {
      await dispatch(sendCode({ content: value }));
      setValue('answer', '');
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: { answer: string }) => {
    const { answer } = data;
    try {
      await dispatch(
        checkAnswer({
          lessonId,
          answer,
        })
      );
      reset();
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
              type: 'auth/logout',
            })
          }
        />

        <div className="container flex flex-col justify-center items-center px-6 pb-4 my-6 mx-auto">
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

              <div className="flex flex-col w-full xl:flex-row">
                <div className="flex flex-col p-8 m-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl xl:w-1/2">
                  <h2>{t('Lessons.lesson-description')}</h2>
                  <p className="overflow-auto h-[580px] whitespace-pre-line">
                    {lesson.description}
                  </p>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4 w-full sm:flex-row sm:space-y-0 sm:space-x-4">
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
                          <CheckIcon className="w-5 h-5" />
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
                <div className="flex flex-col flex-1 m-2 shadow-xl">
                  <Editor
                    className="h-96"
                    defaultLanguage="python"
                    defaultValue=""
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                  />
                  <div>
                    <div className="mx-auto h-96 subpixel-antialiased bg-black rounded border-black shadow-2xl">
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

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      i18n: Object.assign(
        {},
        await import(`../../../../../../i18n/${locale}.json`)
      ),
    },
  };
}

export const getStaticPaths: GetStaticPaths<{
  lessonId: string;
}> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking', //indicates the type of fallback
  };
};
