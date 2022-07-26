import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { Course } from '@app/models/Course';
import type { ApiPayload } from '@app/models/ApiPayload';

export type CourseState = {
  data: Course;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: CourseState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchCourseWithLessons = createAsyncThunk(
  'api/course/with-lessons',
  async (id: string | number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`courses/${id}?include_lessons=true`, {
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

export const courseWithLessonsSlice = createSlice({
  name: 'courseWithLessons',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.courseWithLessons,
        });
      })

      .addCase(fetchCourseWithLessons.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchCourseWithLessons.fulfilled,
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
      .addCase(fetchCourseWithLessons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectCourseWithLessonsData = (state: RootState) =>
  state.courseWithLessons.data;
export const selectCourseWithLessonsError = (state: RootState) =>
  state.courseWithLessons.error;
export const selectCourseWithLessonsStatus = (state: RootState) =>
  state.courseWithLessons.status;

export default courseWithLessonsSlice.reducer;
