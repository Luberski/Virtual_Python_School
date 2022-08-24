export type SurveyResults = {
  surveyId: number;
  surveyResults: {
    questionId: number;
    answerId: number;
  }[];
};
