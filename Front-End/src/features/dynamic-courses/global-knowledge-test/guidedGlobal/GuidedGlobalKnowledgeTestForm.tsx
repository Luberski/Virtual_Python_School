import 'highlight.js/styles/vs2015.css';
import { useEffect, useRef, useState } from 'react';
import { BoltIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { removeKnowledgeTestQuestion } from '../../knowledge-test/knowledgeTestQuestionSlice';
import {
  fetchKnowledgeTests,
  selectKnowledgeTestsData,
} from '../../knowledge-test/knowledgeTestsSlice';
import {
  addGlobalKnowledgeTestQuestion,
  selectGlobalKnowledgeTestQuestions,
} from '../globalKnowledgeTestQuestionSlice';
import { selectGlobalKnowledgeTestData } from '../globalKnowledgeTestSlice';
import GuidedGlobalKnowledgeTestFormStep from './GuidedGlobalKnowledgeTestFormStep';
import GuidedGlobalKnowledgeTestFormCard from './GuidedGlobalKnowledgeTestFormCard';
import GuidedGlobalKnowledgeTestFormCompleted from './GuidedGlobalKnowledgeTestFormCompleted';
import GlobalKnowledgeTestPreview from './GlobalKnowledgeTestPreview';
import Alert from '@app/components/Alert';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import StyledDialog from '@app/components/StyledDialog';
import Button, { ButtonVariant } from '@app/components/Button';
import { useAppSelector } from '@app/hooks';
import Select from '@app/components/Select';
import { parseMarkdown } from '@app/utils';

type GuidedGlobalKnowledgeTestFormProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

type SelectOption = {
  id: number | string;
  name: string;
  disabled: boolean;
};

const SELECT_DEFAULT_VALUE: SelectOption = {
  id: 0,
  name: 'Select question',
  disabled: true,
};

export default function GuidedGlobalKnowledgeTestForm({
  translations,
}: GuidedGlobalKnowledgeTestFormProps) {
  const STEPS = 4;
  const dispatch = useDispatch();

  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);

  const { control, handleSubmit } =
    useForm<{
      selectedQuestion: string | unknown;
    }>();

  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [selected1, setSelected1] = useState(SELECT_DEFAULT_VALUE);

  const cancelButtonRef = useRef(null);

  const closeAddQuestionDialog = () => {
    setIsAddQuestionDialogOpen(false);
  };

  const openAddQuestionDialog = () => {
    setIsAddQuestionDialogOpen(true);
  };

  const knowledgeTestsData = useAppSelector(selectKnowledgeTestsData);

  const globalKnowledgeTestData = useAppSelector(selectGlobalKnowledgeTestData);
  const questions = useAppSelector(selectGlobalKnowledgeTestQuestions);

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchKnowledgeTests());
    }
    fetchData();
  }, [dispatch]);

  const onAddQuestionSubmit = async (data: {
    selectedQuestion: {
      id: number;
      value: string;
      label: string;
      disabled: boolean;
    };
  }) => {
    const { selectedQuestion } = data;
    const selectedQuestionValueData: {
      knowledgeTestId: number;
      questionId: number;
      question: string;
      answer: string;
      lessonId: number;
    } = JSON.parse(selectedQuestion.value);

    try {
      await dispatch(
        addGlobalKnowledgeTestQuestion({
          _id: nanoid(),
          global_knowledge_test_id: globalKnowledgeTestData?.id,
          question: selectedQuestionValueData.question,
          answer: selectedQuestionValueData.answer,
          lesson_id: selectedQuestionValueData.lessonId,
        })
      );

      setSelected1(SELECT_DEFAULT_VALUE);

      closeAddQuestionDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveQuestion = (_id: string) => async () => {
    await dispatch(
      removeKnowledgeTestQuestion({
        _id,
      })
    );
  };

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
                  {translations('KnowledgeTest.guide-alert-1-step')
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
                  {translations('KnowledgeTest.guide-alert-2-step')
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
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('KnowledgeTest.guide-alert-3-step')
                    .split('\n')
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </Alert>
              <div className="flex flex-col items-center justify-center">
                <IconButton
                  variant={IconButtonVariant.PRIMARY}
                  icon={<PlusCircleIcon className="h-5 w-5" />}
                  onClick={openAddQuestionDialog}>
                  {translations('KnowledgeTest.add-question')}
                </IconButton>
                {questions?.length > 0 && (
                  <div className="my-6">
                    <div className="text-xl font-bold">
                      {translations('KnowledgeTest.added-questions')}
                    </div>
                    {questions?.map((question) => (
                      <div
                        className="flex items-center justify-between space-x-4"
                        key={question?._id}>
                        <div
                          className="markdown overflow-auto whitespace-pre-line"
                          dangerouslySetInnerHTML={{
                            __html: parseMarkdown(question?.question),
                          }}
                        />
                        <IconButton
                          variant={IconButtonVariant.FLAT_DANGER}
                          onClick={handleRemoveQuestion(question?._id)}
                          icon={<TrashIcon className="h-5 w-5" />}
                        />
                      </div>
                    ))}
                  </div>
                )}
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
                {translations('KnowledgeTest.knowledge-test-preview')}
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
      <StyledDialog
        title={translations('KnowledgeTest.add-question-to-knowledge-test')}
        isOpen={isAddQuestionDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-sky-100 p-2">
            <BoltIcon className="h-6 w-6 text-sky-600" />
          </div>
        }
        onClose={() => setIsAddQuestionDialogOpen(!isAddQuestionDialogOpen)}>
        <div className="mt-6 max-h-[768px] overflow-y-auto overflow-x-hidden">
          <Alert>
            <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
            <ul className="w-fit max-w-xs list-disc px-6">
              {translations('KnowledgeTest.guide-alert-question')
                .split('\n')
                .map((line) => (
                  <li key={line}>{line}</li>
                ))}
            </ul>
          </Alert>
          <form
            className="mt-6 flex flex-col items-start justify-center space-y-4"
            onSubmit={handleSubmit(onAddQuestionSubmit)}>
            <label
              htmlFor="question"
              className="text-2xl font-bold text-sky-900 dark:text-sky-300">
              {translations('Survey.question')}
            </label>
            <Controller
              control={control}
              name="selectedQuestion"
              render={({ field: { onChange } }) => (
                <Select
                  dataTestId="select-question"
                  options={
                    knowledgeTestsData?.length > 0 &&
                    knowledgeTestsData
                      ?.map((knowledgeTest) => knowledgeTest)
                      .flatMap((knowledgeTest) =>
                        knowledgeTest?.questions?.map((question) => ({
                          id: question?.question_id,
                          value: JSON.stringify({
                            knowledgeTestId: knowledgeTest?.id,
                            questionId: question?.question_id,
                            question: question?.question,
                            answer: question?.answer,
                            lessonId: knowledgeTest.lesson_id,
                          }),
                          label: question?.question.slice(6),
                          disabled: false,
                        }))
                      )
                  }
                  selected={{
                    id: selected1?.id,
                    value: selected1?.name,
                    label: selected1?.name,
                    disabled: false,
                  }}
                  setSelected={({ id, value, label, disabled }) => {
                    onChange({ id, value, label, disabled });
                    setSelected1({
                      id,
                      name: label,
                      disabled: disabled,
                    });
                  }}
                />
              )}
            />

            <div className="flex justify-between space-x-4 py-3">
              <IconButton variant={IconButtonVariant.PRIMARY} type="submit">
                {translations('Manage.add')}
              </IconButton>
              <Button
                variant={ButtonVariant.FLAT_SECONDARY}
                type="button"
                onClick={closeAddQuestionDialog}
                ref={cancelButtonRef}>
                {translations('Manage.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </StyledDialog>
    </div>
  );
}
