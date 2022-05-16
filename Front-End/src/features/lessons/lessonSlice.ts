import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../apiClient';
import { RootState } from '../../store';
import { Lesson } from '../../models/Lesson';
import { HYDRATE } from 'next-redux-wrapper';

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

export const fetchLesson = createAsyncThunk(
  'api/courses/courseId/lesson/lessonId',
  async (
    {
      courseId,
      lessonId,
    }: {
      courseId: string;
      lessonId: string;
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(
        `courses/${courseId}/lessons/${lessonId}`,
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

export const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.lesson });
      })
      .addCase(fetchLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchLesson.fulfilled, (state, { payload: { data, error } }) => {
        if (error) {
          state.data = null;
          state.error = error;
          state.status = 'failed';
        } else {
          state.data = data;
          state.error = null;
          state.status = 'succeeded';
        }
      })
      .addCase(fetchLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectLessonData = (state: RootState) => state.lesson.data;
export const selectLessonError = (state: RootState) => state.lesson.error;
export const selectLessonStatus = (state: RootState) => state.lesson.status;

export default lessonSlice.reducer;
