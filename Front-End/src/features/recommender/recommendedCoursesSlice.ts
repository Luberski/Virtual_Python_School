import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';
import type Course from '@app/models/Course';

export type RecommendedCoursesState = {
  data: Course[];
  status: ApiStatus;
  error: string | null;
};

const initialState: RecommendedCoursesState = {
  data: [],
  status: 'idle',
  error: null,
};

export const fetchRecommendedCourses = createAsyncThunk<ApiPayload<Course[]>>(
  'api/recommender/courses/fetch',
  async (_, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`recommender/courses`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      return data as ApiPayload<Course[]>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const recommendedCoursesSlice = createSlice({
  name: 'recommendedCourses',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.recommendedCourses,
        });
      })
      .addCase(fetchRecommendedCourses.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchRecommendedCourses.fulfilled,
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
      .addCase(fetchRecommendedCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectRecommendedCoursesData = (state: RootState) =>
  state.recommendedCourses.data;
export const selectRecommendedCoursesError = (state: RootState) =>
  state.recommendedCourses.error;
export const selectRecommendedCoursesStatus = (state: RootState) =>
  state.recommendedCourses.status;

export default recommendedCoursesSlice.reducer;
