type Lesson = {
  id: number;
  course_id?: number;
  name: string;
  description: string;
  type: number;
  start_date: string;
  completed: boolean;
};

export default Lesson;
