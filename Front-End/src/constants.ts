import { ReadyState } from 'react-use-websocket';

export const WEBSITE_TITLE = 'Virtual Python School';
export const LESSONS_LIMIT = 3;
export const COURSES_LIMIT = 3;

export const TAG_COLORS = [
  'bg-sky-200 text-sky-900',
  'bg-green-200 text-green-900',
  'bg-yellow-200 text-yellow-900',
  'bg-red-200 text-red-900',
  'bg-blue-200 text-blue-900',
  'bg-pink-200 text-pink-900',
  'bg-purple-200 text-purple-900',
];

export enum Actions {
  NONE = 0,
  JOIN = 1,
  CODE_CHANGE = 2,
  SYNC_DATA = 3,
  LEAVE = 4,
  GET_DATA = 5,
  LOCK_CODE = 6,
  UNLOCK_CODE = 7,
  TEACHER_JOIN = 8,
  CLASSROOM_DELETED = 9,
  ASSIGNMENT_CREATE = 10,
  SUBMIT_ASSIGNMENT = 11,
  GRADE_ASSIGNMENT = 12,
}

export enum ViewMode {
  PersonalWhiteboard = 0,
  ViewUserWhiteboard = 1,
  Assignment = 2,
  SharedWhiteboard = 3,
}

export enum ClassroomUserRole {
  STUDENT = 0,
  TEACHER = 1,
}

export enum AssignmentStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  SUBMITTED = 2,
  COMPLETED = 3,
  CORRECTABLE = 4,
}

export enum UserStatus {
  OFFLINE = 0,
  ONLINE = 1,
}

export enum WhiteboardType {
  PUBLIC = 0,
  PRIVATE = 1,
  ASSIGNMENT = 2,
}

export const connectionStatus = {
  [ReadyState.CONNECTING]: 'Connecting',
  [ReadyState.OPEN]: 'Open',
  [ReadyState.CLOSING]: 'Closing',
  [ReadyState.CLOSED]: 'Closed',
};