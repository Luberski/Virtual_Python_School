type SurveyResults = {
  surveyId: number;
  surveyResults: {
    questionId: number;
    answerId: number;
  }[];
};

export default SurveyResults;
