import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type GlobalKnowledgeTestResultsStats from '@app/models/GlobalKnowledgeTestResultsStats';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type GlobalKnowledgeTestResultsStatsState = {
  data: GlobalKnowledgeTestResultsStats;
  status: ApiStatus;
  error: string | null;
};

const initialState: GlobalKnowledgeTestResultsStatsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchGlobalKnowledgeTestResultsStats = createAsyncThunk<
  ApiPayload<GlobalKnowledgeTestResultsStats>,
  number
>('api/globalKnowledgetests/stats', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`globalknowledgetests/${id}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<GlobalKnowledgeTestResultsStats>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const globalKnowledgeTestResultsStatsSlice = createSlice({
  name: 'globalKnowledgeTestResultsStats',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.globalKnowledgeTestResultsStats,
        });
      })
      .addCase(fetchGlobalKnowledgeTestResultsStats.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchGlobalKnowledgeTestResultsStats.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<GlobalKnowledgeTestResultsStats> }
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
      .addCase(fetchGlobalKnowledgeTestResultsStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectGlobalKnowledgeTestResultsStatsData = (state: RootState) =>
  state.globalKnowledgeTestResultsStats.data;
export const selectGlobalKnowledgeTestResultsStatsError = (state: RootState) =>
  state.globalKnowledgeTestResultsStats.error;
export const selectGlobalKnowledgeTestResultsStatsStatus = (state: RootState) =>
  state.globalKnowledgeTestResultsStats.status;

export default globalKnowledgeTestResultsStatsSlice.reducer;
