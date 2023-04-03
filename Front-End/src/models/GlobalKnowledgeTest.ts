import type GlobalKnowledgeTestQuestion from './GlobalKnowledgeTestQuestion';

type GlobalKnowledgeTest = {
  id: number;
  name: string;
  questions: GlobalKnowledgeTestQuestion[];
};

export default GlobalKnowledgeTest;
