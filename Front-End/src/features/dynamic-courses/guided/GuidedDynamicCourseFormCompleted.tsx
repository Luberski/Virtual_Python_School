type GuidedDynamicCourseFormCompletedProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedDynamicCourseFormCompleted({
  translations,
}: GuidedDynamicCourseFormCompletedProps) {
  return <h3>{translations('Survey.survey-created')}</h3>;
}
