import type { AssignmentStatus } from '@app/constants';
import type ClassroomAssignment from './ClassroomAssignment';
import type ClassroomWhiteboard from './ClassroomWhiteboard';

type ClassroomUserAssignment = {
  userId: string;
  assignment: ClassroomAssignment;
  whiteboard: ClassroomWhiteboard;
  grade: number | null;
  feedback: string | null;
  gradeHistory: Array<{
    grade: number;
    feedback: string;
    timestamp: string;
  }>;
  status: AssignmentStatus;
};

export default ClassroomUserAssignment;
