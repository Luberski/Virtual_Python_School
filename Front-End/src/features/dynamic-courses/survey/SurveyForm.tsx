import { useState } from 'react';
import {
  InformationCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import SurveyFormStep from './SurveyFormStep';
import SurveyFormCard from './SurveyFormCard';
import SurveyFormCompleted from './SurveyFormCompleted';
import type Survey from '@app/models/Survey';
import type SurveyResults from '@app/models/SurveyResults';
import Alert from '@app/components/Alert';

type SurveyFormProps = {
  survey: Survey;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function SurveyForm({ survey, translations }: SurveyFormProps) {
  const [questions] = useState(survey.questions);
  const [steps] = useState<number>(
    questions.length % 3 === 0
      ? questions.length / 3
      : Math.floor(questions.length / 3) + 1
  );
  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);
  //  TODO: move to redux state
  const [surveyResults, setSurveyResults] = useState<SurveyResults>({
    surveyId: survey.id,
    surveyResults: [
      ...survey.questions.map((question) => ({
        questionId: question.question_id,
        answerId: question.answers[0].answer_id,
      })),
    ],
  });

  return (
    <div className="my-6 flex flex-col items-center justify-center space-y-6">
      {formStep > steps - 1 ? (
        <Alert>
          <LightBulbIcon className="mr-2 h-6 w-6" />
          <p className="w-fit max-w-xs">
            {translations('Survey.alert-last-step')}
          </p>
        </Alert>
      ) : (
        <Alert>
          <InformationCircleIcon className="mr-2 h-6 w-6" />
          <p className="w-fit max-w-xs">
            {translations('Survey.alert-first-step')}
          </p>
        </Alert>
      )}
      <SurveyFormCard
        currentStep={formStep}
        steps={steps}
        translations={translations}>
        {[...Array(steps)].map((_, index) => (
          <SurveyFormStep
            key={index}
            currentStep={formStep}
            formStep={index}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            questions={questions.slice(index * 3, index * 3 + 3)}
            steps={steps}
            surveyResults={surveyResults}
            setSurveyResults={setSurveyResults}
            translations={translations}
          />
        ))}
        {formStep > steps - 1 && (
          <SurveyFormCompleted survey={survey} translations={translations} />
        )}
      </SurveyFormCard>
    </div>
  );
}
