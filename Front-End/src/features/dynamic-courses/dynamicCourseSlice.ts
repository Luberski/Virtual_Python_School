import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type DynamicCourse from '@app/models/DynamicCourse';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type DynamicCourseState = {
  data: DynamicCourse;
  status: ApiStatus;
  error: string | null;
};

const initialState: DynamicCourseState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchDynamicCourse = createAsyncThunk<
  ApiPayload<DynamicCourse>,
  number
>('api/dynamic-courses/id', async (id: number, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`dynamic-courses/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<DynamicCourse>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const dynamicCourseSlice = createSlice({
  name: 'dynamicCourse',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.dynamicCourse,
        });
      })

      .addCase(fetchDynamicCourse.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchDynamicCourse.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<DynamicCourse> }
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
      .addCase(fetchDynamicCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectDynamicCourseData = (state: RootState) =>
  state.dynamicCourse.data;
export const selectDynamicCourseError = (state: RootState) =>
  state.dynamicCourse.error;
export const selectDynamicCourseStatus = (state: RootState) =>
  state.dynamicCourse.status;

export default dynamicCourseSlice.reducer;
