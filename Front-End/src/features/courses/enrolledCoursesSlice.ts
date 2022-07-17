import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type { RootState } from '@app/store';
import type { Course } from '@app/models/Course';
import type { ApiPayload } from '@app/models/ApiPayload';
import apiClient from '@app/apiClient';

export type EnrolledCoursesState = {
  data: Course[] | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: EnrolledCoursesState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchEnrolledCourses = createAsyncThunk(
  'api/courses/enrolled',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`courses/enrolled`, {
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
