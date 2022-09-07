import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Course from '@app/models/Course';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type CourseState = {
  data: Course;
  status: ApiStatus;
  error: string | null;
};

const initialState: CourseState = {
  data: null,
  status: 'idle',
  error: null,
};

export const enrollCourse = createAsyncThunk<
  ApiPayload<Course>,
  string | number
>('api/course/enroll', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('course', {
      json: {
        data: { course_id: id },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<Course>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const enrollCourseSlice = createSlice({
  name: 'enrollCourse',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.enrollCourse });
      })
      .addCase(enrollCourse.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        enrollCourse.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Course> }
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
      .addCase(enrollCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectEnrollCourseData = (state: RootState) =>
  state.enrollCourse.data;
export const selectEnrollCourseError = (state: RootState) =>
  state.enrollCourse.error;
export const selectEnrollCourseStatus = (state: RootState) =>
  state.enrollCourse.status;

export default enrollCourseSlice.reducer;
