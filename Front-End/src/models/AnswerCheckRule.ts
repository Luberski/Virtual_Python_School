type AnswerCheckRule =
  | 'equal'
  | 'contain'
  | 'isString'
  | 'isInteger'
  | 'isFloat'
  | 'isBoolean'
  | 'isTrue'
  | 'isFalse'
  | 'regex';

export default AnswerCheckRule;
