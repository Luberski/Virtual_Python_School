import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { Lesson } from '@app/models/Lesson';
import type { ApiPayload } from '@app/models/ApiPayload';

export type LessonState = {
  data: Lesson;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: LessonState = {
  data: null,
  status: 'idle',
  error: null,
};

export const joinLesson = createAsyncThunk(
  'api/lesson/join',
  async (id: string | number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('lesson', {
        json: {
          data: { id_lesson: id },
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

export const joinLessonSlice = createSlice({
  name: 'joinLesson',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.joinLesson });
      })
      .addCase(joinLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        joinLesson.fulfilled,
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
      .addCase(joinLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectJoinLessonData = (state: RootState) =>
  state.joinLesson.data;
export const selectJoinLessonError = (state: RootState) =>
  state.joinLesson.error;
export const selectJoinLessonStatus = (state: RootState) =>
  state.joinLesson.status;

export default joinLessonSlice.reducer;
