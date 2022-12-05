type KnowledgeTestResultsStats = {
  knowledge_test_id: number;
  user_id: number;
  test_passed: boolean;
  total_answers: number;
  total_correct_answers: number;
};

export default KnowledgeTestResultsStats;
