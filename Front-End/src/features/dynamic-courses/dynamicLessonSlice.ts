import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type DynamicLesson from '@app/models/DynamicLesson';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type DynamicLessonState = {
  data: DynamicLesson;
  status: ApiStatus;
  error: string | null;
};

const initialState: DynamicLessonState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchDynamicLesson = createAsyncThunk<
  ApiPayload<DynamicLesson>,
  {
    dynamicCourseId: number;
    dynamicLessonId: number;
  }
>(
  'api/dynamic-courses/dynamicCourseId/dynamicLessons/dynamicLessonId',
  async ({ dynamicCourseId, dynamicLessonId }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(
        `dynamic-courses/${dynamicCourseId}/dynamic-lessons/${dynamicLessonId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();
      return data as ApiPayload<DynamicLesson>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const dynamicLessonSlice = createSlice({
  name: 'dynamicLesson',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.dynamicLesson });
      })
      .addCase(fetchDynamicLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchDynamicLesson.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<DynamicLesson> }
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
      .addCase(fetchDynamicLesson.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectDynamicLessonData = (state: RootState) =>
  state.dynamicLesson.data;
export const selectDynamicLessonError = (state: RootState) =>
  state.dynamicLesson.error;
export const selectDynamicLessonStatus = (state: RootState) =>
  state.dynamicLesson.status;

export default dynamicLessonSlice.reducer;
