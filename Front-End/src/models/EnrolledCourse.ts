import type CourseTag from './CourseTag';
import type Lesson from './Lesson';

type EnrolledCourse = {
  id: number;
  course_id: number;
  name: string;
  description: string;
  featured: boolean;
  enrolled: boolean;
  is_dynamic: boolean;
  start_date: string;
  end_date: string;
  total_lessons_count: number;
  total_completed_lessons_count: number;
  lang?: string;
  tags?: CourseTag[];
  lessons?: Lesson[];
};

export default EnrolledCourse;
