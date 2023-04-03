type SurveyFormCardProps = {
  currentStep: number;
  steps: number;
  translations: (key: string, ...params: unknown[]) => string;
  children: React.ReactNode;
};

export default function SurveyFormCard({
  children,
  currentStep,
  steps,
  translations,
}: SurveyFormCardProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {currentStep < steps && (
        <h2>
          {translations('Form.step-of', {
            currentStep: currentStep + 1,
            steps: steps,
          })}
        </h2>
      )}
      {children}
    </div>
  );
}
