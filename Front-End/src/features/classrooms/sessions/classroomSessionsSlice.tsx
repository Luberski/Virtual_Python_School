import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ClassroomSession from '@app/models/ClassroomSession';
import type ApiPayload from '@app/models/ApiPayload';

export type ClassroomSessionsState = {
  data: ClassroomSession[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: ClassroomSessionsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchClassroomSessions = createAsyncThunk<
  ApiPayload<ClassroomSession[]>
>('api/sessions', async (_: void, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get('sessions', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<ClassroomSession[]>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const classroomSessionsSlice = createSlice({
  name: 'classrooms',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.classroomSessions });
      })
      .addCase(fetchClassroomSessions.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchClassroomSessions.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<ClassroomSession[]> }
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
      .addCase(fetchClassroomSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectClassroomSessionsData = (state: RootState) =>
  state.classroomSessions.data;
export const selectClassroomSessionsError = (state: RootState) =>
  state.classroomSessions.error;
export const selectClassroomSessionsStatus = (state: RootState) =>
  state.classroomSessions.status;

export default classroomSessionsSlice.reducer;
