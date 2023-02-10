import type ClassroomUser from '@app/models/classroom/ClassroomUser';

export type CodeChangeSharedReq = {
  whiteboard_type: string;
  code: string;
};

export type CodeChangePrivateReq = {
    whiteboard_type: string;
    target_user: ClassroomUser;
    code: string;
};

export type CodeChangeAssignmentReq = {
    whiteboard_type: string;
    target_user: ClassroomUser;
    assignment_name: string;
    code: string;
};
