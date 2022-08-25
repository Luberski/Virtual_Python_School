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
  translations: (key: string) => string;
};

export default function SurveyForm({ survey, translations }: SurveyFormProps) {
  // TODO: determine steps based on survey questions
  const STEPS = 2;
  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);
  // TODO: slice by 3 in one state
  const [questions1] = useState(survey.questions.slice(0, 3));
  const [questions2] = useState(survey.questions.slice(3));
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
      {formStep > STEPS - 1 ? (
        <Alert>
          <LightBulbIcon className="mr-2 h-6 w-6" />
          <p className="w-fit max-w-sm">
            {translations('Survey.alert-last-step')}
          </p>
        </Alert>
      ) : (
        <Alert>
          <InformationCircleIcon className="mr-2 h-6 w-6" />
          <p className="w-fit max-w-sm">
            {translations('Survey.alert-first-step')}
          </p>
        </Alert>
      )}
      <SurveyFormCard currentStep={formStep} steps={STEPS}>
        {/* // TODO: use map */}
        {formStep >= 0 && (
          <SurveyFormStep
            currentStep={0}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            questions={questions1}
            steps={STEPS}
            surveyResults={surveyResults}
            setSurveyResults={setSurveyResults}
          />
        )}
        {formStep >= 1 && (
          <SurveyFormStep
            currentStep={1}
            formStep={formStep}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            questions={questions2}
            steps={STEPS}
            surveyResults={surveyResults}
            setSurveyResults={setSurveyResults}
          />
        )}

        {formStep > STEPS - 1 && (
          <SurveyFormCompleted survey={survey} translations={translations} />
        )}
      </SurveyFormCard>
    </div>
  );
}
