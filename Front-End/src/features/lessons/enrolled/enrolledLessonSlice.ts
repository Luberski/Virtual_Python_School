import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { EnrolledLesson } from '@app/models/EnrolledLesson';
import type { ApiPayload } from '@app/models/ApiPayload';

export type EnrolledLessonState = {
  data: EnrolledLesson;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: EnrolledLessonState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchEnrolledLesson = createAsyncThunk(
  'api/courses/courseId/enrolledLesson/enrolledLessonId',
  async (
    {
      lessonId,
      enrolledLessonId,
    }: {
      lessonId: number;
      enrolledLessonId: number;
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(
        `courses/lessons/${lessonId}/${enrolledLessonId}`,
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

export const enrolledLessonSlice = createSlice({
  name: 'enrolledLesson',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.enrolledLesson });
      })
      .addCase(fetchEnrolledLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchEnrolledLesson.fulfilled,
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
      .addCase(fetchEnrolledLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectEnrolledLessonData = (state: RootState) =>
  state.enrolledLesson.data;
export const selectEnrolledLessonError = (state: RootState) =>
  state.enrolledLesson.error;
export const selectEnrolledLessonStatus = (state: RootState) =>
  state.enrolledLesson.status;

export default enrolledLessonSlice.reducer;
