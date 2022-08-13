import type { Lesson } from './Lesson';

export type EnrolledCourse = {
  id: number;
  course_id: number;
  name: string;
  description: string;
  featured: boolean;
  enrolled: boolean;
  start_date: string;
  end_date: string;
  total_lessons_count: number;
  total_completed_lessons_count: number;
  lessons?: Lesson[];
};
