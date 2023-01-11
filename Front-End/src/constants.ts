export const WEBSITE_TITLE = 'Virtual Python School';
export const LESSONS_LIMIT = 3;

export const TAG_COLORS = [
  'bg-indigo-200 text-indigo-900',
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
}

export enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export const connectionStatus = {
  [ReadyState.CONNECTING]: 'Connecting',
  [ReadyState.OPEN]: 'Open',
  [ReadyState.CLOSING]: 'Closing',
  [ReadyState.CLOSED]: 'Closed',
};
