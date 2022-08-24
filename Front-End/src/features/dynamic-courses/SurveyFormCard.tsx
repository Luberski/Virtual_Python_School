type SurveyFormCardProps = {
  currentStep: number;
  steps: number;
  children: React.ReactNode;
};

export default function SurveyFormCard({
  children,
  currentStep,
  steps,
}: SurveyFormCardProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {currentStep < steps && (
        <h2>
          Step {currentStep + 1} of {steps}
        </h2>
      )}
      {children}
    </div>
  );
}
