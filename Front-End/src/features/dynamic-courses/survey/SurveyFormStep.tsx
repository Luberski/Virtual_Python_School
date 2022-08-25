import {
  ArrowRightIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/20/solid';
import { RadioGroup } from '@headlessui/react';
import type { Dispatch, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import { sendSurveyResults } from './surveyResultsSlice';
import IconButton, {
  IconButtonVariant,
  IconPosition,
} from '@app/components/IconButton';
import type SurveyQuestion from '@app/models/SurveyQuestion';
import type SurveyResults from '@app/models/SurveyResults';

type DynamicCourseFormStepProps = {
  currentStep: number;
  formStep: number;
  steps: number;
  prevFormStep: () => void;
  nextFormStep: () => void;
  questions: SurveyQuestion[];
  surveyResults: SurveyResults;
  setSurveyResults: Dispatch<SetStateAction<SurveyResults>>;
};

export default function SurveyFormStep({
  currentStep,
  formStep,
  prevFormStep,
  nextFormStep,
  questions,
  steps,
  surveyResults,
  setSurveyResults,
}: DynamicCourseFormStepProps) {
  const dispatch = useDispatch();

  const onNextStepSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (steps === currentStep + 1) {
      try {
        await dispatch(sendSurveyResults(surveyResults));
      } catch (error) {
        console.error(error);
      }
    }
    nextFormStep();
  };

  const onAnswerChange = (answerId: number, questionId: number) => {
    setSurveyResults((prevSurveyResults) => {
      const newSurveyResults = [...prevSurveyResults.surveyResults];

      newSurveyResults.find(
        (surveyResult) => surveyResult.questionId === questionId
      ).answerId = answerId;
      return { ...prevSurveyResults, surveyResults: newSurveyResults };
    });
  };

  if (formStep === currentStep) {
    return (
      <form onSubmit={onNextStepSubmit}>
        <div className="flex flex-col space-y-6">
          {questions.map((question) => (
            <div key={question.question_id} className="flex flex-col">
              <RadioGroup
                value={
                  surveyResults.surveyResults.find(
                    (surveyResult) =>
                      surveyResult.questionId === question.question_id
                  )?.answerId
                }
                onChange={(value) =>
                  onAnswerChange(value, question.question_id)
                }>
                <RadioGroup.Label>
                  <div className="my-2 text-xl font-bold">
                    {question.question}
                  </div>
                </RadioGroup.Label>
                <div className="flex justify-start space-x-8 py-4 sm:space-x-16">
                  {question.answers.map((answer) => (
                    <RadioGroup.Option
                      key={answer.answer_id}
                      value={answer.answer_id}
                      className="cursor-pointer">
                      {({ checked }) => (
                        <div className="font-medium">
                          {checked ? (
                            <RadioGroup.Label as="div">
                              <div className="flex flex-col items-center">
                                <div className="text-blue-900 dark:text-blue-50">
                                  {answer.name}
                                </div>
                                <div className="brand-shadow mt-2 rounded-lg bg-indigo-50 p-4 text-indigo-900 shadow-indigo-900/25">
                                  <div className="h-3 w-3 rounded-lg bg-indigo-900" />
                                </div>
                              </div>
                            </RadioGroup.Label>
                          ) : (
                            <RadioGroup.Label as="div">
                              <div className="flex flex-col items-center opacity-75">
                                <div>{answer.name}</div>
                                <div className="brand-shadow mt-2 rounded-lg bg-white p-4 shadow-black/25 dark:bg-neutral-700">
                                  <div className="h-3 w-3 rounded-lg bg-neutral-400" />
                                </div>
                              </div>
                            </RadioGroup.Label>
                          )}
                        </div>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
        <div className="my-6 flex justify-center space-x-8">
          {currentStep > 0 && (
            <IconButton
              onClick={prevFormStep}
              type="button"
              icon={<ArrowLeftIcon className="h-5 w-5" />}>
              Back
            </IconButton>
          )}

          {steps === currentStep + 1 ? (
            <IconButton
              variant={IconButtonVariant.PRIMARY}
              type="submit"
              iconPosition={IconPosition.LEFT}
              icon={<PaperAirplaneIcon className="h-5 w-5" />}>
              Submit
            </IconButton>
          ) : (
            <IconButton
              variant={IconButtonVariant.PRIMARY}
              type="submit"
              iconPosition={IconPosition.RIGHT}
              icon={<ArrowRightIcon className="h-5 w-5" />}>
              Next
            </IconButton>
          )}
        </div>
      </form>
    );
  }
}
