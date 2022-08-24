import type { SurveyQuestion } from './SurveyQuestion';

export type Survey = {
  id: number;
  name: string;
  questions: SurveyQuestion[];
};
