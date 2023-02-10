import type ClassroomAssignment from './ClassroomAssignment';
import type ClassroomWhiteboard from './ClassroomWhiteboard';

type ClassroomUserAssignment = {
  userId: string;
  assignment: ClassroomAssignment;
  whiteboard: ClassroomWhiteboard;
  grade: number | null;
  feedback: string | null;
};

export default ClassroomUserAssignment;