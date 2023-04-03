import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type KnowledgeTestResultsStats from '@app/models/KnowledgeTestResultsStats';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type KnowledgeTestResultsStatsState = {
  data: KnowledgeTestResultsStats;
  status: ApiStatus;
  error: string | null;
};

const initialState: KnowledgeTestResultsStatsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchKnowledgeTestResultsStats = createAsyncThunk<
  ApiPayload<KnowledgeTestResultsStats>,
  number
>('api/knowledgetests/stats', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`knowledgetests/${id}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<KnowledgeTestResultsStats>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const knowledgeTestResultsStatsSlice = createSlice({
  name: 'knowledgeTestResultsStats',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.knowledgeTestResultsStats,
        });
      })
      .addCase(fetchKnowledgeTestResultsStats.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchKnowledgeTestResultsStats.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<KnowledgeTestResultsStats> }
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
      .addCase(fetchKnowledgeTestResultsStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectKnowledgeTestResultsStatsData = (state: RootState) =>
  state.knowledgeTestResultsStats.data;
export const selectKnowledgeTestResultsStatsError = (state: RootState) =>
  state.knowledgeTestResultsStats.error;
export const selectKnowledgeTestResultsStatsStatus = (state: RootState) =>
  state.knowledgeTestResultsStats.status;

export default knowledgeTestResultsStatsSlice.reducer;
