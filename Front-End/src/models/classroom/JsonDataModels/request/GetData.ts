import type { WhiteboardType } from '@app/constants';

type GetDataReq = {
  whiteboard_type: WhiteboardType;
  target_user: string;
  assignment_name: string | null;
};

export default GetDataReq;
