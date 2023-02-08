import 'highlight.js/styles/vs2015.css';
import { useRef, useState } from 'react';
import { BoltIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import clsx from 'clsx';
import {
  addKnowledgeTestQuestion,
  removeKnowledgeTestQuestion,
  selectKnowledgeTestQuestions,
} from '../knowledgeTestQuestionSlice';
import { selectKnowledgeTestData } from '../knowledgeTestSlice';
import GuidedKnowledgeTestFormStep from './GuidedKnowledgeTestFormStep';
import GuidedKnowledgeTestFormCard from './GuidedKnowledgeTestFormCard';
import GuidedKnowledgeTestFormCompleted from './GuidedKnowledgeTestFormCompleted';
import KnowledgeTestPreview from './KnowledgeTestPreview';
import Alert from '@app/components/Alert';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import StyledDialog from '@app/components/StyledDialog';
import Input from '@app/components/Input';
import Button, { ButtonVariant } from '@app/components/Button';
import { useAppSelector } from '@app/hooks';
import TextArea from '@app/components/TextArea';
import { parseMarkdown } from '@app/utils';

type GuidedKnowledgeTestFormProps = {
  lessonId: number;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedKnowledgeTestForm({
  lessonId,
  translations,
}: GuidedKnowledgeTestFormProps) {
  const STEPS = 4;
  const dispatch = useDispatch();

  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{
    question: string;
    answer: string;
  }>();

  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const closeAddQuestionDialog = () => {
    setIsAddQuestionDialogOpen(false);
  };

  const openAddQuestionDialog = () => {
    setIsAddQuestionDialogOpen(true);
  };

  const knowledgeTestData = useAppSelector(selectKnowledgeTestData);
  const questions = useAppSelector(selectKnowledgeTestQuestions);

  const onAddQuestionSubmit = async (data: {
    question: string;
    answer: string;
  }) => {
    const { question, answer } = data;

    try {
      await dispatch(
        addKnowledgeTestQuestion({
          knowledge_test_id: knowledgeTestData?.id,
          question,
          _id: nanoid(),
          answer,
        })
      );

      setValue('question', '');
      setValue('answer', '');

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
      <GuidedKnowledgeTestFormCard
        currentStep={formStep}
        steps={STEPS}
        translations={translations}>
        {formStep === 0 && (
          <GuidedKnowledgeTestFormStep
            lessonId={lessonId}
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
          </GuidedKnowledgeTestFormStep>
        )}
        {formStep === 1 && (
          <GuidedKnowledgeTestFormStep
            lessonId={lessonId}
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
          </GuidedKnowledgeTestFormStep>
        )}
        {formStep === 2 && (
          <GuidedKnowledgeTestFormStep
            lessonId={lessonId}
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
          </GuidedKnowledgeTestFormStep>
        )}
        {formStep === 3 && (
          <GuidedKnowledgeTestFormStep
            lessonId={lessonId}
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
                  <KnowledgeTestPreview
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
          </GuidedKnowledgeTestFormStep>
        )}

        {formStep > STEPS - 1 && (
          <GuidedKnowledgeTestFormCompleted translations={translations} />
        )}
      </GuidedKnowledgeTestFormCard>
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
            <TextArea
              label="question"
              name="question"
              type="text"
              register={register}
              required
              maxLength={500}
              rows={4}
              placeholder={translations('Survey.question')}
              className={clsx(
                'resize-none',
                errors.question &&
                  errors.question.type === 'required' &&
                  'border-red-600 dark:border-red-400'
              )}
            />
            <div>
              <h4 className="text-sky-900 dark:text-sky-300">
                {translations('Lessons.answer')}
              </h4>
              <div className="mb-4 text-lg">
                {translations('Lessons.add-answer')}
              </div>
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('KnowledgeTest.guide-alert-answer')
                    .split('\n')
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </Alert>
              <div className="mt-6 flex flex-col space-y-6">
                <Input
                  label="answer"
                  name="answer"
                  type="text"
                  register={register}
                  required
                  maxLength={100}
                  placeholder={translations('Lessons.answer')}
                  className={
                    errors.answer &&
                    errors.answer.type === 'required' &&
                    'border-red-600 dark:border-red-400'
                  }
                />
              </div>
            </div>
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
