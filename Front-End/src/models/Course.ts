import { Lesson } from './Lesson';

export type Course = {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  lessons?: Lesson[];
};
