import type DynamicLesson from './DynamicLesson';

type DynamicCourse = {
  id: number;
  name: string;
  user_id?: number;
  lessons?: DynamicLesson[];
};

export default DynamicCourse;
