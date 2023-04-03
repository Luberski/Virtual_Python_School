import type Classroom from '@app/models/classroom/Classroom';
import type ClassroomUser from '@app/models/classroom/ClassroomUser';

type JoinUserRes = {
  users: ClassroomUser[];
  teacher: ClassroomUser;
  personalData: ClassroomUser;
  classroomData: Classroom;
};

export default JoinUserRes;