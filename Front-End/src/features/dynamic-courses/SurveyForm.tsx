import { useState } from 'react';
import SurveyFormStep from './SurveyFormStep';
import SurveyFormCard from './SurveyFormCard';
import SurveyFormCompleted from './SurveyFormCompleted';
import type { Survey } from '@app/models/Survey';
import type { SurveyResults } from '@app/models/SurveyResults';

type SurveyFormProps = {
  survey: Survey;
};

export default function SurveyForm({ survey }: SurveyFormProps) {
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
    <div className="my-6">
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

        {formStep > STEPS - 1 && <SurveyFormCompleted />}
      </SurveyFormCard>
    </div>
  );
}
