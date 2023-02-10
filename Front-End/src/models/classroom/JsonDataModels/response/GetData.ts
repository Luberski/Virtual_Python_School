import type ClassroomUser from '@app/models/classroom/ClassroomUser';
import type ClassroomWhiteboard from '@app/models/classroom/ClassroomWhiteboard';
import type ClassroomUserAssignment from '../../ClassroomUserAssignment';

type GetDataRes = {
    whiteboard: ClassroomWhiteboard;
    targetUser: ClassroomUser | null;
    userAssignment: ClassroomUserAssignment | null;
};

export default GetDataRes;