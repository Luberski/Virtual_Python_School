import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type CourseTag from '@app/models/CourseTag';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type CourseTagsState = {
  data: CourseTag[];
  status: ApiStatus;
  error: string | null;
};

const initialState: CourseTagsState = {
  data: [],
  status: 'idle',
  error: null,
};

export const createCourseTag = createAsyncThunk<
  ApiPayload<CourseTag>,
  {
    courseId: number;
    name: string;
  }
>('api/tags/create', async ({ courseId, name }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('tags/courses', {
      json: {
        data: {
          course_id: courseId,
          name: name,
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<CourseTag>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const deleteCourseTag = createAsyncThunk<ApiPayload<CourseTag>, number>(
  'api/tags/delete',
  async (id, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.delete(`tags/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<CourseTag>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchCourseTagsByCourseId = createAsyncThunk<
  ApiPayload<CourseTag[]>,
  number
>('api/tags/fetch', async (course_id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`tags/courses/${course_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<CourseTag[]>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const courseTagsSlice = createSlice({
  name: 'courseTags',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.courseTags });
      })
      .addCase(createCourseTag.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createCourseTag.fulfilled,
        (state, { payload }: { payload: ApiPayload<CourseTag> }) => {
          state.data = [...state.data, payload.data];
        }
      )
      .addCase(createCourseTag.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(
        deleteCourseTag.fulfilled,
        (state, { payload }: { payload: ApiPayload<CourseTag> }) => {
          state.data = state.data.filter(
            (course) => course.id !== payload.data.id
          );
        }
      )
      .addCase(deleteCourseTag.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteCourseTag.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(
        fetchCourseTagsByCourseId.fulfilled,
        (state, { payload }: { payload: ApiPayload<CourseTag[]> }) => {
          state.data = payload.data;
        }
      )
      .addCase(fetchCourseTagsByCourseId.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchCourseTagsByCourseId.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const selectCourseTagsData = (state: RootState) => state.courseTags.data;
export const selectCourseTagsError = (state: RootState) =>
  state.courseTags.error;
export const selectCourseTagsStatus = (state: RootState) =>
  state.courseTags.status;

export default courseTagsSlice.reducer;
