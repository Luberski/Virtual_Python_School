type KnowledgeTestResultsStats = {
  knowledge_test_id: number;
  user_id: number;
  test_passed: boolean;
  total_answers: number;
  total_correct_answers: number;
  incorrect_answers?: {
    id: number;
    question: string;
  }[];
};

export default KnowledgeTestResultsStats;
