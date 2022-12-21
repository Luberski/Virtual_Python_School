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
  JOINED = 2,
  DISCONNECTED = 3,
  CODE_CHANGE = 4,
  SYNC_CODE = 5,
  LEAVE = 6,
  GET_CODE = 7,
  GET_CODE_RESPONSE = 8,
  CODE_SUBMITTED = 9,
  LOCK_CODE = 10,
  UNLOCK_CODE = 11,
  TEACHER_JOIN = 12,
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
