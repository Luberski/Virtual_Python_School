import type ClassroomUser from '@app/models/classroom/ClassroomUser';
import type ClassroomUserAssignment from '@app/models/classroom/ClassroomUserAssignment';

type AssignmentSendReviewRes = {
  source: ClassroomUser;
  userAssignment: ClassroomUserAssignment;
};

export default AssignmentSendReviewRes;
