import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type GlobalKnowledgeTestResults from '@app/models/GlobalKnowledgeTestResults';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type GlobalKnowledgeTestResultsState = {
  data: GlobalKnowledgeTestResults;
  status: ApiStatus;
  error: string | null;
};

const initialState: GlobalKnowledgeTestResultsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const sendGlobalKnowledgeTestResults = createAsyncThunk<
  ApiPayload<GlobalKnowledgeTestResults>,
  GlobalKnowledgeTestResults
>('api/globalKnowledgeTests/results', async (globalKnowledgeTestResults, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('globalknowledgetests/user/answers', {
      json: {
        data: {
          global_knowledge_test_id: globalKnowledgeTestResults.globalKnowledgeTestId,
          results: globalKnowledgeTestResults.results.map((result) => ({
            question_id: result.questionId,
            answer: result.answer,
          })),
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<GlobalKnowledgeTestResults>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const globalKnowledgeTestResultsSlice = createSlice({
  name: 'globalKnowledgeTestResults',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.globalKnowledgeTestResults,
        });
      })

      .addCase(sendGlobalKnowledgeTestResults.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        sendGlobalKnowledgeTestResults.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<GlobalKnowledgeTestResults> }
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
      .addCase(sendGlobalKnowledgeTestResults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectGlobalKnowledgeTestResultsData = (state: RootState) =>
  state.globalKnowledgeTestResults.data;
export const selectGlobalKnowledgeTestResultsError = (state: RootState) =>
  state.globalKnowledgeTestResults.error;
export const selectGlobalKnowledgeTestResultsStatus = (state: RootState) =>
  state.globalKnowledgeTestResults.status;

export default globalKnowledgeTestResultsSlice.reducer;
