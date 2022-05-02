import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../apiClient';
import { RootState } from '../../store';
import { Course } from '../../models/Course';
import { HYDRATE } from 'next-redux-wrapper';

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

export const fetchCourse = createAsyncThunk(
  'api/course',
  async (id: string | number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const enrollCourse = createAsyncThunk(
  'api/course/enroll',
  async (id: string | number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post(
        '/course',
        {
          data: { id_course: id },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return res.data;

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.courses });
      })
      .addCase(fetchCourse.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchCourse.fulfilled, (state, { payload: { data, error } }) => {
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
      .addCase(fetchCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(enrollCourse.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        enrollCourse.fulfilled,
        (state, { payload: { data, error } }) => {
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

export const selectCourseData = (state: RootState) => state.course.data;
export const selectCourseError = (state: RootState) => state.course.error;
export const selectCourseStatus = (state: RootState) => state.course.status;

export const selectEnrollCourseData = (state: RootState) => state.course.data;
export const selectEnrollCourseError = (state: RootState) => state.course.error;
export const selectEnrollCourseStatus = (state: RootState) =>
  state.course.status;

export default courseSlice.reducer;
