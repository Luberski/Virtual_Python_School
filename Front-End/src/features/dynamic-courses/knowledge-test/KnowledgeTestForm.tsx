import 'highlight.js/styles/vs2015.css';
import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import KnowledgeTestFormStep from './KnowledgeTestFormStep';
import KnowledgeTestFormCard from './KnowledgeTestFormCard';
import KnowledgeTestFormCompleted from './KnowledgeTestFormCompleted';
import type KnowledgeTest from '@app/models/KnowledgeTest';
import Alert from '@app/components/Alert';

type KnowledgeTestFormProps = {
  knowledgeTest: KnowledgeTest;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function KnowledgeTestForm({
  knowledgeTest,
  translations,
}: KnowledgeTestFormProps) {
  const [questions] = useState(knowledgeTest.questions);
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
            {translations('KnowledgeTest.alert-last-step')}
          </p>
        </Alert>
      ) : (
        <Alert>
          <InformationCircleIcon className="mr-2 h-6 w-6 self-start" />
          <ul className="w-fit max-w-xs list-disc px-6">
            {translations('KnowledgeTest.alert-first-step')
              .split('\n')
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
          </ul>
        </Alert>
      )}
      <KnowledgeTestFormCard>
        {[...Array(steps)].map((_, index) => (
          <KnowledgeTestFormStep
            key={index}
            currentStep={formStep}
            formStep={index}
            prevFormStep={prevFormStep}
            nextFormStep={nextFormStep}
            questions={questions}
            knowledgeTestId={knowledgeTest.id}
            steps={steps}
            translations={translations}
          />
        ))}
        {formStep > steps - 1 && (
          <KnowledgeTestFormCompleted translations={translations} />
        )}
      </KnowledgeTestFormCard>
    </div>
  );
}
