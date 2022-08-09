import type { Lesson } from './Lesson';

export type Course = {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  enrolled: boolean;
  lessons?: Lesson[];
};
