import type { Actions } from '@app/constants'

type ClassroomJsonMessage = {
    action: Actions;
    data: unknown | null;
}

export default ClassroomJsonMessage;