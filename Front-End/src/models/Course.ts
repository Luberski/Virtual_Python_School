import type { Lesson } from './Lesson';

export type Course = {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  enrolled: boolean;
  total_lessons_count: number;
  total_completed_lessons_count: number;
  lessons?: Lesson[];
};
