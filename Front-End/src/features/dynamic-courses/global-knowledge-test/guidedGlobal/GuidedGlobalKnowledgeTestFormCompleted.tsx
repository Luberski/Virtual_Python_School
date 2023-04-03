type GuidedGlobalKnowledgeTestFormCompletedProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedGlobalKnowledgeTestFormCompleted({
  translations,
}: GuidedGlobalKnowledgeTestFormCompletedProps) {
  return <h3>{translations('KnowledgeTest.global-knowledge-test-created')}</h3>;
}
