type DynamicLesson = {
  id: number;
  lesson_id: number;
  name: string;
  description: string;
  type: number;
  number_of_questions: number;
  start_date: string;
  end_date: string;
  completed: boolean;
};

export default DynamicLesson;
