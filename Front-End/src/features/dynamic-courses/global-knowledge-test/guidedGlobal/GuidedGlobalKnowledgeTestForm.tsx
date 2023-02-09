import 'highlight.js/styles/vs2015.css';
import { useEffect, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import {
  FolderMinusIcon,
  FolderPlusIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import { useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import Image from 'next/image';
import clsx from 'clsx';
import {
  fetchKnowledgeTests,
  selectKnowledgeTestsData,
} from '../../knowledge-test/knowledgeTestsSlice';
import type { QuestionData } from '../globalKnowledgeTestQuestionSlice';
import {
  addGlobalKnowledgeTestQuestion,
  removeGlobalKnowledgeTestQuestion,
  selectGlobalKnowledgeTestQuestions,
} from '../globalKnowledgeTestQuestionSlice';
import { selectGlobalKnowledgeTestData } from '../globalKnowledgeTestSlice';
import GuidedGlobalKnowledgeTestFormStep from './GuidedGlobalKnowledgeTestFormStep';
import GuidedGlobalKnowledgeTestFormCard from './GuidedGlobalKnowledgeTestFormCard';
import GuidedGlobalKnowledgeTestFormCompleted from './GuidedGlobalKnowledgeTestFormCompleted';
import GlobalKnowledgeTestPreview from './GlobalKnowledgeTestPreview';
import Alert from '@app/components/Alert';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import { useAppSelector } from '@app/hooks';
import { parseMarkdown } from '@app/utils';
import type KnowledgeTestQuestion from '@app/models/KnowledgeTestQuestion';

type GuidedGlobalKnowledgeTestFormProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedGlobalKnowledgeTestForm({
  translations,
}: GuidedGlobalKnowledgeTestFormProps) {
  const STEPS = 4;
  const dispatch = useDispatch();

  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);

  const knowledgeTestsData = useAppSelector(selectKnowledgeTestsData);

  const globalKnowledgeTestData = useAppSelector(selectGlobalKnowledgeTestData);
  const questions = useAppSelector(selectGlobalKnowledgeTestQuestions);

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchKnowledgeTests());
    }
    fetchData();
  }, [dispatch]);

  const handleRemoveQuestion = (_id: string) => async () => {
    await dispatch(
      removeGlobalKnowledgeTestQuestion({
        _id,
      })
    );
  };

  const handleAddQuestion =
    (selectedQuestion: {
      question: string;
      answer: string;
      lessonId: number;
    }) =>
    async () => {
      try {
        await dispatch(
          addGlobalKnowledgeTestQuestion({
            _id: nanoid(),
            global_knowledge_test_id: globalKnowledgeTestData?.id,
            question: selectedQuestion.question,
            answer: selectedQuestion.answer,
            lesson_id: selectedQuestion.lessonId,
          })
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleAddAllQuestions = async () => {
    try {
      await Promise.all(
        knowledgeTestsData.map((knowledgeTest) =>
          knowledgeTest.questions.map((question) =>
            dispatch(
              addGlobalKnowledgeTestQuestion({
                _id: nanoid(),
                global_knowledge_test_id: globalKnowledgeTestData?.id,
                question: question.question,
                answer: question.answer,
                lesson_id: knowledgeTest.lesson_id,
              })
            )
          )
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveAllQuestions = async () => {
    try {
      await Promise.all(
        questions.map((question) =>
          dispatch(
            removeGlobalKnowledgeTestQuestion({
              _id: question._id,
            })
          )
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  function findTemporarilyAddedQuestion(
    questions: QuestionData[],
    question: KnowledgeTestQuestion
  ) {
    return questions.find(
      (q) => q.question === question.question && q.answer === question.answer
    );
  }

  return (
    <div className="my-6 flex flex-col items-center justify-center space-y-6">
      <GuidedGlobalKnowledgeTestFormCard
        currentStep={formStep}
        steps={STEPS}
        translations={translations}>
        {formStep === 0 && (
          <GuidedGlobalKnowledgeTestFormStep
            currentStep={0}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <>
              <h3 className="text-center text-sky-900 dark:text-sky-300">
                {translations('KnowledgeTest.introduction')}
              </h3>
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('KnowledgeTest.global-guide-alert-1-step')
                    .split('\n')
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </Alert>
            </>
          </GuidedGlobalKnowledgeTestFormStep>
        )}
        {formStep === 1 && (
          <GuidedGlobalKnowledgeTestFormStep
            currentStep={1}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <>
              <h3 className="text-center text-sky-900 dark:text-sky-300">
                {translations('KnowledgeTest.introduction')}
              </h3>
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('KnowledgeTest.global-guide-alert-2-step')
                    .split('\n')
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </Alert>
            </>
          </GuidedGlobalKnowledgeTestFormStep>
        )}
        {formStep === 2 && (
          <GuidedGlobalKnowledgeTestFormStep
            currentStep={2}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <>
              <h3 className="text-center text-sky-900 dark:text-sky-300">
                {translations('KnowledgeTest.questions')}
              </h3>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Alert>
                  <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                  <ul className="w-fit max-w-xs list-disc px-6">
                    {translations('KnowledgeTest.global-guide-alert-3-step')
                      .split('\n')
                      .map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                  </ul>
                </Alert>
                <div className="flex flex-col items-center justify-center">
                  {questions?.length > 0 && (
                    <div className="my-6">
                      <div className="text-xl font-bold">
                        {translations('KnowledgeTest.added-questions')}
                      </div>
                    </div>
                  )}
                  <div>
                    {knowledgeTestsData && knowledgeTestsData.length > 0 ? (
                      <div className="my-6 overflow-auto rounded-lg border border-neutral-300 dark:border-neutral-600">
                        <div className="m-3 flex justify-end">
                          <IconButton
                            variant={
                              questions?.length > 0
                                ? IconButtonVariant.OUTLINE_DANGER
                                : IconButtonVariant.OUTLINE_PRIMARY
                            }
                            onClick={
                              questions?.length > 0
                                ? handleRemoveAllQuestions
                                : handleAddAllQuestions
                            }
                            icon={
                              questions?.length > 0 ? (
                                <FolderMinusIcon className="h-5 w-5" />
                              ) : (
                                <FolderPlusIcon className="h-5 w-5" />
                              )
                            }>
                            {questions?.length > 0
                              ? translations('Manage.delete-all')
                              : translations('Manage.add-all')}
                          </IconButton>
                        </div>
                        <table className="w-full table-auto divide-y divide-neutral-200">
                          <thead className="text-left font-medium uppercase text-neutral-500">
                            <tr>
                              <th scope="col" className="py-3 px-4">
                                {translations('Manage.no-short')}
                              </th>
                              <th scope="col" className="py-3 px-4">
                                {translations('Manage.name')}
                              </th>
                              <th scope="col" className="py-3 px-4">
                                {translations('Survey.questions')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200">
                            {knowledgeTestsData.map((knowledgeTest, key) => {
                              return (
                                <tr key={knowledgeTest.id}>
                                  <td className="p-4">{(key += 1)}</td>
                                  <td className="p-4">{knowledgeTest.name}</td>
                                  <td className="max-w-5xl p-4">
                                    {knowledgeTest.questions.map(
                                      (question, key) => {
                                        return (
                                          <div key={key}>
                                            <div className="my-3 flex items-center space-x-4">
                                              <div
                                                className={clsx(
                                                  'markdown w-full overflow-auto whitespace-pre-line',
                                                  findTemporarilyAddedQuestion(
                                                    questions,
                                                    question
                                                  ) &&
                                                    'brand-shadow rounded-lg border border-sky-900 shadow-sky-900/25 dark:border-sky-300'
                                                )}
                                                dangerouslySetInnerHTML={{
                                                  __html: parseMarkdown(
                                                    question.question
                                                  ),
                                                }}
                                              />
                                              <IconButton
                                                variant={
                                                  findTemporarilyAddedQuestion(
                                                    questions,
                                                    question
                                                  )
                                                    ? IconButtonVariant.OUTLINE_DANGER
                                                    : IconButtonVariant.OUTLINE_PRIMARY
                                                }
                                                icon={
                                                  findTemporarilyAddedQuestion(
                                                    questions,
                                                    question
                                                  ) ? (
                                                    <TrashIcon className="h-5 w-5" />
                                                  ) : (
                                                    <PlusCircleIcon className="h-5 w-5" />
                                                  )
                                                }
                                                onClick={() => {
                                                  if (
                                                    findTemporarilyAddedQuestion(
                                                      questions,
                                                      question
                                                    )
                                                  ) {
                                                    handleRemoveQuestion(
                                                      findTemporarilyAddedQuestion(
                                                        questions,
                                                        question
                                                      )._id
                                                    )();
                                                  } else {
                                                    handleAddQuestion({
                                                      question:
                                                        question.question,
                                                      answer: question.answer,
                                                      lessonId:
                                                        knowledgeTest.lesson_id,
                                                    })();
                                                  }
                                                }}>
                                                {findTemporarilyAddedQuestion(
                                                  questions,
                                                  question
                                                )
                                                  ? translations(
                                                      'Manage.delete'
                                                    )
                                                  : translations('Manage.add')}
                                              </IconButton>
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center">
                        <p className="pb-8 text-lg font-medium">
                          {translations('KnowledgeTest.no-questions-found')}
                        </p>
                        <Image
                          src="/undraw_no_data_re_kwbl.svg"
                          alt="No data"
                          width={200}
                          height={200}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          </GuidedGlobalKnowledgeTestFormStep>
        )}
        {formStep === 3 && (
          <GuidedGlobalKnowledgeTestFormStep
            currentStep={3}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <div className="flex flex-col space-y-4">
              <h3 className="text-center text-sky-900 dark:text-sky-300">
                {translations('KnowledgeTest.global-knowledge-test-preview')}
              </h3>
              {questions?.length > 0 ? (
                <div>
                  <GlobalKnowledgeTestPreview
                    translations={translations}
                    questions={questions?.map((question) => ({
                      question: question?.question,
                      answer: question?.answer,
                    }))}
                  />
                </div>
              ) : (
                <div className="text-center text-xl">
                  {translations('KnowledgeTest.no-questions-added')}
                </div>
              )}
            </div>
          </GuidedGlobalKnowledgeTestFormStep>
        )}

        {formStep > STEPS - 1 && (
          <GuidedGlobalKnowledgeTestFormCompleted translations={translations} />
        )}
      </GuidedGlobalKnowledgeTestFormCard>
    </div>
  );
}
