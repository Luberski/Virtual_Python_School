export enum RuleType {
  SKIP = 0,
  LESSON = 1,
}

type SurveyAnswer = {
  answer_id?: number;
  name: string;
  rule_type?: RuleType;
  rule_value?: number;
};

export default SurveyAnswer;
