import type KnowledgeTestQuestion from './KnowledgeTestQuestion';

type KnowledgeTest = {
  id: number;
  name: string;
  questions: KnowledgeTestQuestion[];
};

export default KnowledgeTest;
