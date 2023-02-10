import type { Actions } from '@app/constants';

type JsonResponse <T> = {
    action: Actions;
    data: T;
}

export default JsonResponse