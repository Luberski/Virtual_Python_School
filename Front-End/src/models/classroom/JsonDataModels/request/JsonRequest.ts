import type { Actions } from '@app/constants';

type JsonRequest<T> = {
  action: Actions;
  user_id: string;
  data: T;
};

export default JsonRequest;
