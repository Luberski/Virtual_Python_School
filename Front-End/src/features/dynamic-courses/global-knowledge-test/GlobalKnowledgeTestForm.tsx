import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import GlobalKnowledgeTestFormStep from './GlobalKnowledgeTestFormStep';
import GlobalKnowledgeTestFormCard from './GlobalKnowledgeTestFormCard';
import GlobalKnowledgeTestFormCompleted from './GlobalKnowledgeTestFormCompleted';
import type GlobalKnowledgeTest from '@app/models/GlobalKnowledgeTest';
import Alert from '@app/components/Alert';

type GlobalKnowledgeTestFormProps = {
  globalKnowledgeTest: GlobalKnowledgeTest;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GlobalKnowledgeTestForm({
  globalKnowledgeTest,
  translations,
}: GlobalKnowledgeTestFormProps) {
  const [questions] = useState(globalKnowledgeTest.questions);
  const [steps] = useState<number>(1);
  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);

  return (
    <div className="my-6 flex flex-col items-center justify-center space-y-6">
      {formStep > steps - 1 ? (
        <Alert>
          <InformationCircleIcon className="mr-2 h-6 w-6" />
          <p className="w-fit max-w-xs">
            {translations('KnowledgeTest.alert-last-step-global')}
          </p>
        </Alert>
      ) : (
        <Alert>
          <InformationCircleIcon className="mr-2 h-6 w-6 self-start" />
          <ul className="w-fit max-w-xs list-disc px-6">
            {translations('KnowledgeTest.alert-first-step-global')
              .split('\n')
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
          </ul>
        </Alert>
      )}
      <GlobalKnowledgeTestFormCard>
        {[...Array(steps)].map((_, index) => (
          <GlobalKnowledgeTestFormStep
            key={index}
            currentStep={formStep}
            formStep={index}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            questions={questions}
            globalKnowledgeTestId={globalKnowledgeTest.id}
            steps={steps}
            translations={translations}
          />
        ))}
        {formStep > steps - 1 && (
          <GlobalKnowledgeTestFormCompleted
            globalKnowledgeTest={globalKnowledgeTest}
            translations={translations}
          />
        )}
      </GlobalKnowledgeTestFormCard>
    </div>
  );
}
