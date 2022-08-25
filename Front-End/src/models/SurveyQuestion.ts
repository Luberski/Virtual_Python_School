import type SurveyAnswer from './SurveyAnswer';

type SurveyQuestion = {
  question_id: number;
  question: string;
  answers: SurveyAnswer[];
};
export default SurveyQuestion;
