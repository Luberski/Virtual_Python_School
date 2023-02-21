import type ClassroomAssignment from '@app/models/classroom/ClassroomAssignment';
import type ClassroomUser from '../../ClassroomUser';

type AssignmentCreateRes = {
    assignment: ClassroomAssignment;
    students: ClassroomUser[];
}

export default AssignmentCreateRes