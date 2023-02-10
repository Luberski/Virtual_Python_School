import type ClassroomUserAssignment from './ClassroomUserAssignment';
import type ClassroomWhiteboard from './ClassroomWhiteboard';

type ClassroomUser = {
  userId: string;
  role: string;
  whiteboard: ClassroomWhiteboard;
  userAssignments: ClassroomUserAssignment[];
  online: boolean;
};

export default ClassroomUser;