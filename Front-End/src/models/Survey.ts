import type SurveyQuestion from './SurveyQuestion';

type Survey = {
  id: number;
  name: string;
  featured?: boolean;
  questions: SurveyQuestion[];
};

export default Survey;
