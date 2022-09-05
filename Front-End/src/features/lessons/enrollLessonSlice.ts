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

export const enrollLesson = createAsyncThunk<
  ApiPayload<Lesson>,
  { lessonId: number; enrolledCourseId: number }
>('api/lesson/join', async ({ lessonId, enrolledCourseId }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('lesson', {
      json: {
        data: { lesson_id: lessonId, enrolled_course_id: enrolledCourseId },
      },
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
});

export const enrollLessonSlice = createSlice({
  name: 'enrollLesson',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.enrollLesson });
      })
      .addCase(enrollLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        enrollLesson.fulfilled,
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
      .addCase(enrollLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectJoinLessonData = (state: RootState) =>
  state.enrollLesson.data;
export const selectJoinLessonError = (state: RootState) =>
  state.enrollLesson.error;
export const selectJoinLessonStatus = (state: RootState) =>
  state.enrollLesson.status;

export default enrollLessonSlice.reducer;
