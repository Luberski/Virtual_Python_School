import {
  ArrowRightIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/20/solid';
import { useDispatch } from 'react-redux';
import { useFieldArray, useForm } from 'react-hook-form';
import { sendGlobalKnowledgeTestResults } from './globalKnowledgeTestResultsSlice';
import { fetchGlobalKnowledgeTestResultsStats } from './globalKnowledgeTestResultsStatsSlice';
import IconButton, {
  IconButtonVariant,
  IconPosition,
} from '@app/components/IconButton';
import type GlobalKnowledgeTestQuestion from '@app/models/GlobalKnowledgeTestQuestion';
import type GlobalKnowledgeTestResults from '@app/models/GlobalKnowledgeTestResults';
import Input from '@app/components/Input';
import { parseMarkdown } from '@app/utils';

type GlobalKnowledgeTestFormStepProps = {
  currentStep: number;
  formStep: number;
  steps: number;
  prevFormStep: () => void;
  nextFormStep: () => void;
  questions: GlobalKnowledgeTestQuestion[];
  globalKnowledgeTestId: number;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GlobalKnowledgeTestFormStep({
  currentStep,
  formStep,
  prevFormStep,
  nextFormStep,
  questions,
  steps,
  globalKnowledgeTestId,
  translations,
}: GlobalKnowledgeTestFormStepProps) {
  const dispatch = useDispatch();
  const { control, handleSubmit, register } = useForm();
  useFieldArray({
    control,
    name: 'results',
  });

  const onNextStepSubmit = async (data: {
    results: { answer: string; questionId: number }[];
  }) => {
    const { results } = data;

    if (steps === currentStep + 1) {
      try {
        await dispatch(
          sendGlobalKnowledgeTestResults({
            globalKnowledgeTestId,
            results: results.map((result) => ({
              questionId: result.questionId,
              answer: result.answer,
            })),
          } as GlobalKnowledgeTestResults)
        ).unwrap();

        await dispatch(
          fetchGlobalKnowledgeTestResultsStats(globalKnowledgeTestId)
        ).unwrap();
      } catch (error) {
        console.error(error);
      }
      nextFormStep();
    }
  };

  if (formStep === currentStep) {
    return (
      <form onSubmit={handleSubmit(onNextStepSubmit)}>
        <div className="flex flex-col space-y-6">
          {questions.map((question, index) => (
            <div key={question.question_id} className="flex flex-col">
              <div
                className="markdown overflow-auto whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(question.question),
                }}
              />
              <input
                type="hidden"
                value={question.question_id}
                {...register(`results.${index}.questionId`)}
              />
              <Input
                label={`results.${index}.answer`}
                name={`results.${index}.answer`}
                placeholder={translations('Lessons.answer')}
                required={true}
                register={register}
              />
            </div>
          ))}
        </div>
        <div className="my-6 flex justify-center space-x-8">
          {currentStep > 0 && (
            <IconButton
              onClick={prevFormStep}
              type="button"
              icon={<ArrowLeftIcon className="h-5 w-5" />}>
              {translations('Form.back')}
            </IconButton>
          )}

          {steps === currentStep + 1 ? (
            <IconButton
              variant={IconButtonVariant.PRIMARY}
              type="submit"
              iconPosition={IconPosition.LEFT}
              icon={<PaperAirplaneIcon className="h-5 w-5" />}>
              {translations('Form.submit')}
            </IconButton>
          ) : (
            <IconButton
              variant={IconButtonVariant.PRIMARY}
              type="submit"
              iconPosition={IconPosition.RIGHT}
              icon={<ArrowRightIcon className="h-5 w-5" />}>
              {translations('Form.next')}
            </IconButton>
          )}
        </div>
      </form>
    );
  }
}
