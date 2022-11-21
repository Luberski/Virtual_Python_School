import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Classroom from '@app/models/Classroom';
import type ApiPayload from '@app/models/ApiPayload';

export type ClassroomState = {
  data: Classroom;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: ClassroomState = {
  data: null,
  status: 'idle',
  error: null,
};

export const joinClassroom = createAsyncThunk(
  'api/classroom/join',
  async (id: string | number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('classroom', {
        json: {
          data: { classroom_id: id },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const joinClassroomSlice = createSlice({
  name: 'joinClassroom',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.joinClassroom });
      })
      .addCase(joinClassroom.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        joinClassroom.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload | any }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.data = data;
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(joinClassroom.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectJoinClassroomData = (state: RootState) =>
  state.joinClassroom.data;
export const selectJoinClassroomError = (state: RootState) =>
  state.joinClassroom.error;
export const selectJoinClassroomStatus = (state: RootState) =>
  state.joinClassroom.status;

export default joinClassroomSlice.reducer;
