import type ClassroomUser from '@app/models/classroom/ClassroomUser';
import type ClassroomWhiteboard from '@app/models/classroom/ClassroomWhiteboard';
import type ClassroomUserAssignment from '@app/models/classroom/ClassroomUserAssignment';

type CodeChangeRes = {
  source: ClassroomUser;
  whiteboard: ClassroomWhiteboard;
  userAssignment: ClassroomUserAssignment | null;
};

export default CodeChangeRes;
