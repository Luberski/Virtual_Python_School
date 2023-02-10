import type Classroom from '@app/models/classroom/Classroom';
import type ClassroomUser from '@app/models/classroom/ClassroomUser';

type JoinTeacherRes = {
  classroomData: Classroom;
  personalData: ClassroomUser;
};

export default JoinTeacherRes;
