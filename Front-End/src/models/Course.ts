import type CourseTag from './CourseTag';
import type Lesson from './Lesson';

type Course = {
  id: number;
  name: string;
  description: string;
  featured: boolean;
  enrolled: boolean;
  total_lessons_count: number;
  total_completed_lessons_count: number;
  lessons?: Lesson[];
  lang?: string;
  tags?: CourseTag[];
};

export default Course;
