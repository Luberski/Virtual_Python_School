import type DynamicLesson from './DynamicLesson';

type DynamicCourse = {
  id: number;
  name: string;
  lessons: DynamicLesson[];
};

export default DynamicCourse;
