type KnowledgeTestResults = {
  knowledgeTestId: number;
  results: {
    questionId: number;
    answer: string;
  }[];
};

export default KnowledgeTestResults;
