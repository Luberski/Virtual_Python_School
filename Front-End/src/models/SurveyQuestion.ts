import type { SurveyAnswer } from './SurveyAnswer';

export type SurveyQuestion = {
  question_id: number;
  question: string;
  answers: SurveyAnswer[];
};
