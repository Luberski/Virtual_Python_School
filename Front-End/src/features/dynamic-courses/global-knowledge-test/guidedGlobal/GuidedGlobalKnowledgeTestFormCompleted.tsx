type GuidedGlobalKnowledgeTestFormCompletedProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedGlobalKnowledgeTestFormCompleted({
  translations,
}: GuidedGlobalKnowledgeTestFormCompletedProps) {
  return <h3>{translations('KnowledgeTest.knowledge-test-created')}</h3>;
}
