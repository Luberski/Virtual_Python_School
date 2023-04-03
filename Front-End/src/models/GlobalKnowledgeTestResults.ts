type GlobalKnowledgeTestResults = {
  globalKnowledgeTestId: number;
  results: {
    questionId: number;
    answer: string;
  }[];
};

export default GlobalKnowledgeTestResults;
