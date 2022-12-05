type GuidedKnowledgeTestFormCompletedProps = {
  translations: (key: string, ...params: unknown[]) => string;
};

export default function GuidedKnowledgeTestFormCompleted({
  translations,
}: GuidedKnowledgeTestFormCompletedProps) {
  return <h3>{translations('KnowledgeTest.knowledge-test-created')}</h3>;
}
