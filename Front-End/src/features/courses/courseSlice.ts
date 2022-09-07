import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Course from '@app/models/Course';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type CourseState = {
  data: Course;
  status: ApiStatus;
  error: string | null;
};

const initialState: CourseState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchCourse = createAsyncThunk<
  ApiPayload<Course>,
  string | number
>('api/course', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`courses/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<Course>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const editCourse = createAsyncThunk<
  ApiPayload<Course>,
  {
    courseId: string;
    name?: string;
    description?: string;
    featured?: boolean;
  }
>(
  'api/courses/edit',
  async ({ courseId, name, description, featured }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.patch('courses', {
        json: {
          data: {
            course_id: courseId,
            ...(name && { name }),
            ...(description && { description }),
            featured,
          },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<Course>;
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
        return Object.assign({}, state, { ...action.payload.course });
      })
      .addCase(fetchCourse.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchCourse.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Course> }
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
      .addCase(fetchCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(
        editCourse.fulfilled,
        (state, { payload }: { payload: ApiPayload<Course> }) => {
          state.data = { ...state.data, ...payload.data };
        }
      );
  },
});

export const selectCourseData = (state: RootState) => state.course.data;
export const selectCourseError = (state: RootState) => state.course.error;
export const selectCourseStatus = (state: RootState) => state.course.status;

export default courseSlice.reducer;
