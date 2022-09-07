import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type EnrolledCourse from '@app/models/EnrolledCourse';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type EnrolledCourseState = {
  data: EnrolledCourse;
  status: ApiStatus;
  error: string | null;
};

const initialState: EnrolledCourseState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchEnrolledCourseWithLessons = createAsyncThunk<
  ApiPayload<EnrolledCourse>,
  { id: string | number }
>('api/course/enrolled/with-lessons', async ({ id }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const endpoint = `courses/${id}/enrolled?include_lessons=true`;
    const res = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<EnrolledCourse>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const enrolledCourseWithLessonsSlice = createSlice({
  name: 'enrolledCourseWithLessons',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.enrolledCourseWithLessons,
        });
      })

      .addCase(fetchEnrolledCourseWithLessons.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchEnrolledCourseWithLessons.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<EnrolledCourse> }
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
      .addCase(fetchEnrolledCourseWithLessons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectEnrolledCourseWithLessonsData = (state: RootState) =>
  state.enrolledCourseWithLessons.data;
export const selectEnrolledCourseWithLessonsError = (state: RootState) =>
  state.enrolledCourseWithLessons.error;
export const selectEnrolledCourseWithLessonsStatus = (state: RootState) =>
  state.enrolledCourseWithLessons.status;

export default enrolledCourseWithLessonsSlice.reducer;
