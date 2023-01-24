import type AnswerCheckRule from './AnswerCheckRule';

type Answer = {
  id: number;
  lessonId: number;
  finalAnswer: string;
  answerCheckRule: AnswerCheckRule;
};

export default Answer;
