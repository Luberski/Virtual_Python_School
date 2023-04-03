import type KnowledgeTestQuestion from './KnowledgeTestQuestion';

type KnowledgeTest = {
  id: number;
  name: string;
  lesson_id: number;
  questions: KnowledgeTestQuestion[];
};

export default KnowledgeTest;
