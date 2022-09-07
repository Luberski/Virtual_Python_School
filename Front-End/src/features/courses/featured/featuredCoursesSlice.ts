import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Course from '@app/models/Course';
import type ApiPayload from '@app/models/ApiPayload';

export type FeaturedCoursesState = {
  data: Course[] | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: FeaturedCoursesState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchFeaturedCourses = createAsyncThunk<ApiPayload<Course[]>>(
  'api/courses/featured',
  async (_: void) => {
    try {
      const res = await apiClient.get('courses/featured', {});

      const data = await res.json();
      return data as ApiPayload<Course[]>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const featuredCoursesSlice = createSlice({
  name: 'courses/featured',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.featuredCourses });
      })
      .addCase(fetchFeaturedCourses.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchFeaturedCourses.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Course[]> }
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
      .addCase(fetchFeaturedCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const selectFeaturedCoursesData = (state: RootState) =>
  state.featuredCourses.data;
export const selectFeaturedCoursesError = (state: RootState) =>
  state.featuredCourses.error;
export const selectFeaturedCoursesStatus = (state: RootState) =>
  state.featuredCourses.status;

export default featuredCoursesSlice.reducer;
