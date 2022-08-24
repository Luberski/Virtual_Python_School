import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { Course } from '@app/models/Course';
import type { ApiPayload } from '@app/models/ApiPayload';

export type CoursesState = {
  data: Course[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: CoursesState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchCourses = createAsyncThunk(
  'api/courses',
  async (
    {
      includeLessons = false,
      limitLessons,
    }: { includeLessons?: boolean; limitLessons?: number | null },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      let endpoint = `courses?include_lessons=${includeLessons}`;
      if (limitLessons) {
        endpoint = `courses?include_lessons=true&limit_lessons=${limitLessons}`;
      }
      const res = await apiClient.get(endpoint, {
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

export const deleteCourse = createAsyncThunk(
  'api/courses/delete',
  async (id: string | number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.delete(`courses/${id}`, {
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

export const createCourse = createAsyncThunk(
  'api/courses/create',
  async (
    {
      name,
      description,
      featured = false,
    }: { name: string; description: string; featured: boolean },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('courses', {
        json: {
          data: { name, description, featured },
        },
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

export const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.courses });
      })
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchCourses.fulfilled,
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
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(
        deleteCourse.fulfilled,
        (state, { payload }: { payload: ApiPayload | any }) => {
          state.data = state.data.filter(
            (course) => course.id !== payload.data.id
          );
        }
      )
      .addCase(
        createCourse.fulfilled,
        (state, { payload }: { payload: ApiPayload | any }) => {
          state.data = [...state.data, payload.data];
        }
      );
  },
});

export const selectCoursesData = (state: RootState) => state.courses.data;
export const selectCoursesError = (state: RootState) => state.courses.error;
export const selectCoursesStatus = (state: RootState) => state.courses.status;

export default coursesSlice.reducer;
