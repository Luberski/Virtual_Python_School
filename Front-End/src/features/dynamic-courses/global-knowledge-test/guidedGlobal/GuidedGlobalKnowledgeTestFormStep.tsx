import {
  ArrowRightIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/20/solid';
import { useDispatch } from 'react-redux';
import { createGlobalKnowledgeTest } from '../globalKnowledgeTestSlice';
import {
  createGlobalKnowledgeTestQuestionsWithAnswers,
  selectGlobalKnowledgeTestQuestions,
} from '../globalKnowledgeTestQuestionSlice';
import IconButton, {
  IconButtonVariant,
  IconPosition,
} from '@app/components/IconButton';
import { useAppSelector } from '@app/hooks';

type GuidedGlobalKnowledgeTestFormStepProps = {
  currentStep: number;
  formStep: number;
  steps: number;
  prevFormStep: () => void;
  nextFormStep: () => void;
  children?: React.ReactNode;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedGlobalKnowledgeTestFormStep({
  currentStep,
  formStep,
  prevFormStep,
  nextFormStep,
  steps,
  children,
  translations,
}: GuidedGlobalKnowledgeTestFormStepProps) {
  const dispatch = useDispatch();
  const questions = useAppSelector(selectGlobalKnowledgeTestQuestions);

  const onNextStepSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (steps === currentStep + 1) {
      try {
        await dispatch(
          createGlobalKnowledgeTest({
            name: 'Global Knowledge Test',
          })
        );
        await dispatch(createGlobalKnowledgeTestQuestionsWithAnswers());
      } catch (error) {
        console.error(error);
      }
    }
    nextFormStep();
  };

  if (formStep === currentStep) {
    return (
      <form onSubmit={onNextStepSubmit}>
        <div className="flex flex-col space-y-6">{children}</div>
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
              disabled={!questions || questions.length === 0}
              iconPosition={IconPosition.LEFT}
              icon={<PaperAirplaneIcon className="h-5 w-5" />}>
              {translations('Form.submit')}
            </IconButton>
          ) : currentStep === 0 ? (
            <IconButton
              variant={IconButtonVariant.PRIMARY}
              type="submit"
              iconPosition={IconPosition.RIGHT}
              icon={<ArrowRightIcon className="h-5 w-5" />}>
              {translations('Form.begin')}
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
