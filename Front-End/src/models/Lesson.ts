import type AnswerCheckRule from './AnswerCheckRule';

type Lesson = {
  id: number;
  course_id?: number;
  name: string;
  description: string;
  type: number;
  start_date: string;
  completed: boolean;
  final_answer?: string;
  answer_check_rule?: AnswerCheckRule;
  order?: number;
};

export default Lesson;
