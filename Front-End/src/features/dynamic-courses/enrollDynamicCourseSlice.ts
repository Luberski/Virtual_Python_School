import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type EnrollDynamicCourse from '@app/models/EnrollDynamicCourse';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

export type EnrollDynamicCourseState = {
  data: EnrollDynamicCourse;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: EnrollDynamicCourseState = {
  data: null,
  status: 'idle',
  error: null,
};

export const enrollDynamicCourse = createAsyncThunk<
  ApiPayload<EnrollDynamicCourse>,
  { surveyId: number; name: string }
>('api/dynamic-courses/enroll', async ({ surveyId, name }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('dynamic-courses', {
      json: {
        data: {
          survey_id: surveyId,
          name,
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<EnrollDynamicCourse>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const enrollDynamicCourseSlice = createSlice({
  name: 'enrollDynamicCourse',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.enrollDynamicCourse,
        });
      })

      .addCase(enrollDynamicCourse.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        enrollDynamicCourse.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<EnrollDynamicCourse> }
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
      .addCase(enrollDynamicCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectEnrollDynamicCourseData = (state: RootState) =>
  state.enrollDynamicCourse.data;
export const selectEnrollDynamicCourseError = (state: RootState) =>
  state.enrollDynamicCourse.error;
export const selectEnrollDynamicCourseStatus = (state: RootState) =>
  state.enrollDynamicCourse.status;

export default enrollDynamicCourseSlice.reducer;
