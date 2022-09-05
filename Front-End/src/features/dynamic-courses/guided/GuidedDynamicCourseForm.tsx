import { useEffect, useRef, useState } from 'react';
import { BoltIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { nanoid } from 'nanoid';
import {
  addSurveyQuestion,
  removeSurveyQuestion,
  selectSurveyQuestions,
} from '../survey/surveyQuestionSlice';
import { selectSurveyData, setSurveyAsFeatured } from '../survey/surveySlice';
import GuidedDynamicCourseFormStep from './GuidedDynamicCourseFormStep';
import GuidedDynamicCourseFormCard from './GuidedDynamicCourseFormCard';
import GuidedDynamicCourseFormCompleted from './GuidedDynamicCourseFormCompleted';
import SurveyPreview from './SurveyPreview';
import Alert from '@app/components/Alert';
import IconButton, { IconButtonVariant } from '@app/components/IconButton';
import StyledDialog from '@app/components/StyledDialog';
import Input from '@app/components/Input';
import Button, { ButtonVariant } from '@app/components/Button';
import Select from '@app/components/Select';
import {
  fetchAllLessons,
  selectLessonsData,
} from '@app/features/lessons/lessonsSlice';
import { useAppSelector } from '@app/hooks';
import { RuleType } from '@app/models/SurveyAnswer';
import Checkbox from '@app/components/Checkbox';

type GuidedDynamicCourseFormProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

const SELECT_DEFAULT_VALUE = { id: 0, name: 'Select lesson', disabled: true };

export default function GuidedDynamicCourseForm({
  translations,
}: GuidedDynamicCourseFormProps) {
  const STEPS = 4;
  const dispatch = useDispatch();

  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{
    question: string;
    selectedLesson1: string | unknown;
    selectedLesson2: string | unknown;
    selectedLesson3: string | unknown;
    selectedLesson4: string | unknown;
  }>();

  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const closeAddQuestionDialog = () => {
    setIsAddQuestionDialogOpen(false);
  };

  const openAddQuestionDialog = () => {
    setIsAddQuestionDialogOpen(true);
  };

  const [selected1, setSelected1] = useState(SELECT_DEFAULT_VALUE);
  const [skipLesson1, setSkipLesson1] = useState(false);
  const [selected2, setSelected2] = useState(SELECT_DEFAULT_VALUE);
  const [skipLesson2, setSkipLesson2] = useState(false);
  const [selected3, setSelected3] = useState(SELECT_DEFAULT_VALUE);
  const [skipLesson3, setSkipLesson3] = useState(false);
  const [selected4, setSelected4] = useState(SELECT_DEFAULT_VALUE);
  const [skipLesson4, setSkipLesson4] = useState(false);

  const handleSkipLesson1 = () => {
    setSkipLesson1(!skipLesson1);
  };

  const handleSkipLesson2 = () => {
    setSkipLesson2(!skipLesson2);
  };

  const handleSkipLesson3 = () => {
    setSkipLesson3(!skipLesson3);
  };

  const handleSkipLesson4 = () => {
    setSkipLesson4(!skipLesson4);
  };

  const lessonsData = useAppSelector(selectLessonsData);
  const surveyData = useAppSelector(selectSurveyData);
  const questions = useAppSelector(selectSurveyQuestions);

  const handleSurveyFeatured = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSurveyAsFeatured(e.target.checked));
  };

  const onAddQuestionSubmit = async (data: {
    question: string;
    selectedLesson1: { id: number; value: string; disabled: boolean };
    selectedLesson2: { id: number; value: string; disabled: boolean };
    selectedLesson3: { id: number; value: string; disabled: boolean };
    selectedLesson4: { id: number; value: string; disabled: boolean };
  }) => {
    const {
      question,
      selectedLesson1,
      selectedLesson2,
      selectedLesson3,
      selectedLesson4,
    } = data;

    try {
      await dispatch(
        addSurveyQuestion({
          survey_id: surveyData?.id,
          question,
          _id: nanoid(),
          answers: [
            {
              name: 'Nothing',
              rule_type: skipLesson1 ? RuleType.SKIP : RuleType.LESSON,
              rule_value: skipLesson1 ? 0 : selectedLesson1.id,
            },
            {
              name: 'Something',
              rule_type: skipLesson2 ? RuleType.SKIP : RuleType.LESSON,
              rule_value: skipLesson2 ? 0 : selectedLesson2.id,
            },
            {
              name: 'Good',
              rule_type: skipLesson3 ? RuleType.SKIP : RuleType.LESSON,
              rule_value: skipLesson3 ? 0 : selectedLesson3.id,
            },
            {
              name: 'Great',
              rule_type: skipLesson4 ? RuleType.SKIP : RuleType.LESSON,
              rule_value: skipLesson4 ? 0 : selectedLesson4.id,
            },
          ],
        })
      );

      setValue('question', '');

      setSkipLesson1(false);
      setSelected1(SELECT_DEFAULT_VALUE);
      setSkipLesson2(false);
      setSelected2(SELECT_DEFAULT_VALUE);
      setSkipLesson3(false);
      setSelected3(SELECT_DEFAULT_VALUE);
      setSkipLesson4(false);
      setSelected4(SELECT_DEFAULT_VALUE);

      closeAddQuestionDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveQuestion = (_id: string) => async () => {
    await dispatch(
      removeSurveyQuestion({
        _id,
      })
    );
  };

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchAllLessons());
    }
    fetchData();
  }, [dispatch]);

  return (
    <div className="my-6 flex flex-col items-center justify-center space-y-6">
      <GuidedDynamicCourseFormCard
        currentStep={formStep}
        steps={STEPS}
        translations={translations}>
        {formStep === 0 && (
          <GuidedDynamicCourseFormStep
            currentStep={0}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <>
              <h3 className="text-center text-indigo-900 dark:text-indigo-300">
                {translations('DynamicCourse.introduction')}
              </h3>
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('DynamicCourse.guide-alert-1-step')
                    .split('\n')
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </Alert>
            </>
          </GuidedDynamicCourseFormStep>
        )}
        {formStep === 1 && (
          <GuidedDynamicCourseFormStep
            currentStep={1}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <>
              <h3 className="text-center text-indigo-900 dark:text-indigo-300">
                {translations('DynamicCourse.introduction')}
              </h3>
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('DynamicCourse.guide-alert-2-step')
                    .split('\n')
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </Alert>
            </>
          </GuidedDynamicCourseFormStep>
        )}
        {formStep === 2 && (
          <GuidedDynamicCourseFormStep
            currentStep={2}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <>
              <h3 className="text-center text-indigo-900 dark:text-indigo-300">
                {translations('Survey.questions')}
              </h3>
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('DynamicCourse.guide-alert-3-step')
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
                  {translations('Survey.add-question')}
                </IconButton>
                {questions?.length > 0 && (
                  <div className="my-6">
                    <div className="text-xl font-bold">
                      {translations('Survey.added-questions')}
                    </div>
                    {questions?.map((question) => (
                      <div
                        className="flex items-center justify-between"
                        key={question?._id}>
                        <div>{question?.question}</div>
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
          </GuidedDynamicCourseFormStep>
        )}
        {formStep === 3 && (
          <GuidedDynamicCourseFormStep
            currentStep={3}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            steps={STEPS}
            translations={translations}>
            <div className="flex flex-col space-y-4">
              <h3 className="text-center text-indigo-900 dark:text-indigo-300">
                {translations('Survey.survey-preview')}
              </h3>
              {questions?.length > 0 ? (
                <div>
                  <div className="flex items-center">
                    <Checkbox
                      id="featured"
                      name="featured"
                      label="featured"
                      checked={surveyData?.featured}
                      onChange={handleSurveyFeatured}
                    />
                    <label htmlFor="featured" className="ml-2">
                      {translations('Survey.featured')}
                    </label>
                  </div>
                  <SurveyPreview
                    questions={questions?.map((question) => ({
                      question: question?.question,
                      answers: question?.answers?.map((answer) => ({
                        name: answer?.name,
                      })),
                    }))}
                  />
                </div>
              ) : (
                <div className="text-center text-xl">
                  {translations('Survey.no-questions-added')}
                </div>
              )}
            </div>
          </GuidedDynamicCourseFormStep>
        )}

        {formStep > STEPS - 1 && (
          <GuidedDynamicCourseFormCompleted translations={translations} />
        )}
      </GuidedDynamicCourseFormCard>
      <StyledDialog
        title={translations('Survey.add-question-for-survey')}
        isOpen={isAddQuestionDialogOpen}
        icon={
          <div className="h-fit rounded-lg bg-indigo-100 p-2">
            <BoltIcon className="h-6 w-6 text-indigo-600" />
          </div>
        }
        onClose={() => setIsAddQuestionDialogOpen(!isAddQuestionDialogOpen)}>
        <div className="mt-6">
          <Alert>
            <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
            <ul className="w-fit max-w-xs list-disc px-6">
              {translations('DynamicCourse.guide-alert-question')
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
              className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">
              {translations('Survey.question')}
            </label>
            <Input
              label="question"
              name="question"
              type="text"
              register={register}
              required
              maxLength={100}
              placeholder={translations('Survey.question')}
              className={
                errors.question &&
                errors.question.type === 'required' &&
                'border-red-600 dark:border-red-400'
              }
            />
            <div>
              <h4 className="text-indigo-900 dark:text-indigo-300">
                {translations('Survey.rules')}
              </h4>
              <div className="mb-4 text-lg">
                {translations('Survey.add-new-rule')}
              </div>
              <Alert>
                <InformationCircleIcon className="mr-4 h-6 w-6 self-start" />
                <ul className="w-fit max-w-xs list-disc px-6">
                  {translations('DynamicCourse.guide-alert-rules')
                    .split('\n')
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </Alert>
              <div className="mt-6 flex h-36 flex-col space-y-6 overflow-auto">
                <div className="flex flex-col space-y-2">
                  <div className="text-lg">Answer: Nothing</div>
                  <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-stretch sm:space-x-2 sm:space-y-1">
                    <Controller
                      control={control}
                      name="selectedLesson1"
                      rules={{ required: !skipLesson1 }}
                      render={({ field: { onChange } }) => (
                        <Select
                          className={
                            errors.selectedLesson1 &&
                            errors.selectedLesson1.type === 'required' &&
                            'border-red-600 dark:border-red-400'
                          }
                          disabled={skipLesson1}
                          options={
                            lessonsData?.length > 0 &&
                            lessonsData.map((lesson) => {
                              return {
                                id: lesson.id,
                                value: lesson.name,
                                disabled: false,
                              };
                            })
                          }
                          selected={{
                            id: selected1?.id,
                            value: selected1?.name,
                            disabled: false,
                          }}
                          setSelected={({ id, value, disabled }) => {
                            onChange({ id, value, disabled });
                            setSelected1({
                              id,
                              name: value,
                              disabled: disabled,
                            });
                          }}
                        />
                      )}
                    />
                    <Button
                      variant={
                        skipLesson1
                          ? ButtonVariant.PRIMARY
                          : ButtonVariant.OUTLINE_PRIMARY
                      }
                      onClick={handleSkipLesson1}>
                      Skip
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-lg">Answer: Something</div>
                  <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-stretch sm:space-x-2 sm:space-y-1">
                    <Controller
                      control={control}
                      name="selectedLesson2"
                      rules={{ required: !skipLesson2 }}
                      render={({ field: { onChange } }) => (
                        <Select
                          className={
                            errors.selectedLesson2 &&
                            errors.selectedLesson2.type === 'required' &&
                            'border-red-600 dark:border-red-400'
                          }
                          disabled={skipLesson2}
                          options={
                            lessonsData?.length > 0 &&
                            lessonsData.map((lesson) => {
                              return {
                                id: lesson.id,
                                value: lesson.name,
                                disabled: false,
                              };
                            })
                          }
                          selected={{
                            id: selected2?.id,
                            value: selected2?.name,
                            disabled: false,
                          }}
                          setSelected={({ id, value, disabled }) => {
                            onChange({ id, value, disabled });
                            setSelected2({
                              id,
                              name: value,
                              disabled: disabled,
                            });
                          }}
                        />
                      )}
                    />
                    <Button
                      variant={
                        skipLesson2
                          ? ButtonVariant.PRIMARY
                          : ButtonVariant.OUTLINE_PRIMARY
                      }
                      onClick={handleSkipLesson2}>
                      Skip
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-lg">Answer: Good</div>
                  <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-stretch sm:space-x-2 sm:space-y-1">
                    <Controller
                      control={control}
                      name="selectedLesson3"
                      rules={{ required: !skipLesson3 }}
                      render={({ field: { onChange } }) => (
                        <Select
                          className={
                            errors.selectedLesson3 &&
                            errors.selectedLesson3.type === 'required' &&
                            'border-red-600 dark:border-red-400'
                          }
                          disabled={skipLesson3}
                          options={
                            lessonsData?.length > 0 &&
                            lessonsData.map((lesson) => {
                              return {
                                id: lesson.id,
                                value: lesson.name,
                                disabled: false,
                              };
                            })
                          }
                          selected={{
                            id: selected3?.id,
                            value: selected3?.name,
                            disabled: false,
                          }}
                          setSelected={({ id, value, disabled }) => {
                            onChange({ id, value, disabled });
                            setSelected3({
                              id,
                              name: value,
                              disabled: disabled,
                            });
                          }}
                        />
                      )}
                    />
                    <Button
                      variant={
                        skipLesson3
                          ? ButtonVariant.PRIMARY
                          : ButtonVariant.OUTLINE_PRIMARY
                      }
                      onClick={handleSkipLesson3}>
                      Skip
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-lg">Answer: Great</div>
                  <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-stretch sm:space-x-2 sm:space-y-1">
                    <Controller
                      control={control}
                      name="selectedLesson4"
                      rules={{ required: !skipLesson4 }}
                      render={({ field: { onChange } }) => (
                        <Select
                          className={
                            errors.selectedLesson4 &&
                            errors.selectedLesson4.type === 'required' &&
                            'border-red-600 dark:border-red-400'
                          }
                          disabled={skipLesson4}
                          options={
                            lessonsData?.length > 0 &&
                            lessonsData.map((lesson) => {
                              return {
                                id: lesson.id,
                                value: lesson.name,
                                disabled: false,
                              };
                            })
                          }
                          selected={{
                            id: selected4?.id,
                            value: selected4?.name,
                            disabled: false,
                          }}
                          setSelected={({ id, value, disabled }) => {
                            onChange({ id, value, disabled });
                            setSelected4({
                              id,
                              name: value,
                              disabled: disabled,
                            });
                          }}
                        />
                      )}
                    />
                    <Button
                      variant={
                        skipLesson4
                          ? ButtonVariant.PRIMARY
                          : ButtonVariant.OUTLINE_PRIMARY
                      }
                      onClick={handleSkipLesson4}>
                      Skip
                    </Button>
                  </div>
                </div>
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
