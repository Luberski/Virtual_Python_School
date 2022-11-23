import type DynamicLesson from './DynamicLesson';

type DynamicCourse = {
  id: number;
  name: string;
  user_id?: number;
  total_lessons_count: number;
  total_completed_lessons_count: number;
  lessons?: DynamicLesson[];
};

export default DynamicCourse;
