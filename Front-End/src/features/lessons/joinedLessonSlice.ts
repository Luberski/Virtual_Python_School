import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { JoinedLesson } from '@app/models/JoinedLesson';
import type { ApiPayload } from '@app/models/ApiPayload';

export type JoinedLessonState = {
  data: JoinedLesson;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: JoinedLessonState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchJoinedLesson = createAsyncThunk(
  'api/courses/courseId/joinedLesson/joinedLessonId',
  async (
    {
      lessonId,
      joinedLessonId,
    }: {
      lessonId: string;
      joinedLessonId: string;
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(
        `courses/lessons/${lessonId}/${joinedLessonId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const joinedLessonSlice = createSlice({
  name: 'joinedLesson',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.joinedLesson });
      })
      .addCase(fetchJoinedLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchJoinedLesson.fulfilled,
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
      .addCase(fetchJoinedLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectJoinedLessonData = (state: RootState) =>
  state.joinedLesson.data;
export const selectJoinedLessonError = (state: RootState) =>
  state.joinedLesson.error;
export const selectJoinedLessonStatus = (state: RootState) =>
  state.joinedLesson.status;

export default joinedLessonSlice.reducer;
