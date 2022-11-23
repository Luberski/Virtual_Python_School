type GuidedDynamicCourseFormCardProps = {
  currentStep: number;
  steps: number;
  children: React.ReactNode;
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedDynamicCourseFormCard({
  children,
  currentStep,
  steps,
  translations,
}: GuidedDynamicCourseFormCardProps) {
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
