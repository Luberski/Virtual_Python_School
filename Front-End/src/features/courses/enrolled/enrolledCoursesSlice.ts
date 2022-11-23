import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import apiClient from '@app/apiClient';
import type EnrolledCourse from '@app/models/EnrolledCourse';
import type ApiStatus from '@app/models/ApiStatus';

export type EnrolledCoursesState = {
  data: EnrolledCourse[] | null;
  status: ApiStatus;
  error: string | null;
};

const initialState: EnrolledCoursesState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchEnrolledCourses = createAsyncThunk<
  ApiPayload<EnrolledCourse[]>,
  {
    includeLessons?: boolean;
    limitLessons?: number | null;
    limit?: number | null;
  }
>(
  'api/courses/enrolled',
  async ({ includeLessons = false, limitLessons, limit }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const queryParams = [];
      if (includeLessons) {
        queryParams.push(`include_lessons=${includeLessons}`);
      }
      if (limitLessons) {
        queryParams.push(`limit_lessons=${limitLessons}`);
      }
      if (limit) {
        queryParams.push(`limit=${limit}`);
      }

      let endpoint = `courses/enrolled`;
      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join('&')}`;
      }

      const res = await apiClient.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      return data as ApiPayload<EnrolledCourse[]>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const enrolledCoursesSlice = createSlice({
  name: 'courses/enrolled',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.enrolledCourses });
      })
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchEnrolledCourses.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<EnrolledCourse[]> }
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
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const selectEnrolledCoursesData = (state: RootState) =>
  state.enrolledCourses.data;
export const selectEnrolledCoursesError = (state: RootState) =>
  state.enrolledCourses.error;
export const selectEnrolledCoursesStatus = (state: RootState) =>
  state.enrolledCourses.status;

export default enrolledCoursesSlice.reducer;
