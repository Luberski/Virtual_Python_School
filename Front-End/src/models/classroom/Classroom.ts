import type ClassroomAssignment from './ClassroomAssignment';
import type ClassroomUser from './ClassroomUser';
import type ClassroomWhiteboard from './ClassroomWhiteboard';

type Classroom = {
  id: string;
  users: ClassroomUser[];
  sharedWhiteboard: ClassroomWhiteboard;
  assignments: ClassroomAssignment[];
  editable: boolean;
};

export default Classroom;