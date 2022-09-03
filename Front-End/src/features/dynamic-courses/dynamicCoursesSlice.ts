import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type DynamicCourse from '@app/models/DynamicCourse';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

export type DynamicCoursesState = {
  data: DynamicCourse[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: DynamicCoursesState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchDynamicCourses = createAsyncThunk(
  'api/dynamic-courses/all',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`dynamic-courses`, {
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

export const dynamicCoursesSlice = createSlice({
  name: 'dynamicCourses',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.dynamicCourses,
        });
      })

      .addCase(fetchDynamicCourses.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchDynamicCourses.fulfilled,
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
      .addCase(fetchDynamicCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectDynamicCoursesData = (state: RootState) =>
  state.dynamicCourses.data;
export const selectDynamicCoursesError = (state: RootState) =>
  state.dynamicCourses.error;
export const selectDynamicCoursesStatus = (state: RootState) =>
  state.dynamicCourses.status;

export default dynamicCoursesSlice.reducer;
