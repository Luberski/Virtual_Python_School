import type SurveyQuestion from './SurveyQuestion';

type Survey = {
  id: number;
  name: string;
  questions: SurveyQuestion[];
};

export default Survey;
