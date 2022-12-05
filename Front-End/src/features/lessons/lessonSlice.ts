import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Lesson from '@app/models/Lesson';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type LessonState = {
  data: Lesson;
  status: ApiStatus;
  error: string | null;
};

const initialState: LessonState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchLesson = createAsyncThunk<
  ApiPayload<Lesson>,
  {
    courseId: string;
    lessonId: string;
  }
>(
  'api/courses/courseId/lesson/lessonId',
  async ({ courseId, lessonId }, thunkApi) => {
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
      return data as ApiPayload<Lesson>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchLessonById = createAsyncThunk<ApiPayload<Lesson>, number>(
  'api/lessons/lessonId',
  async (lessonId, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<Lesson>;
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
      .addCase(
        fetchLesson.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Lesson> }
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
      .addCase(fetchLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchLessonById.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchLessonById.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Lesson> }
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
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectLessonData = (state: RootState) => state.lesson.data;
export const selectLessonError = (state: RootState) => state.lesson.error;
export const selectLessonStatus = (state: RootState) => state.lesson.status;

export default lessonSlice.reducer;
