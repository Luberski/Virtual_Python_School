import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';
import type Lesson from '@app/models/Lesson';

export type RecommendedLessonsState = {
  data: Lesson[];
  status: ApiStatus;
  error: string | null;
};

const initialState: RecommendedLessonsState = {
  data: [],
  status: 'idle',
  error: null,
};

export const fetchRecommendedLessons = createAsyncThunk<ApiPayload<Lesson[]>>(
  'api/recommender/lessons/fetch',
  async (_, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`recommender/lessons`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      return data as ApiPayload<Lesson[]>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const recommendedLessonsSlice = createSlice({
  name: 'recommendedLessons',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.recommendedLessons,
        });
      })
      .addCase(fetchRecommendedLessons.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchRecommendedLessons.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Lesson[]> }
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
      .addCase(fetchRecommendedLessons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectRecommendedLessonsData = (state: RootState) =>
  state.recommendedLessons.data;
export const selectRecommendedLessonsError = (state: RootState) =>
  state.recommendedLessons.error;
export const selectRecommendedLessonsStatus = (state: RootState) =>
  state.recommendedLessons.status;

export default recommendedLessonsSlice.reducer;
