import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type KnowledgeTestResults from '@app/models/KnowledgeTestResults';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type KnowledgeTestResultsState = {
  data: KnowledgeTestResults;
  status: ApiStatus;
  error: string | null;
};

const initialState: KnowledgeTestResultsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const sendKnowledgeTestResults = createAsyncThunk<
  ApiPayload<KnowledgeTestResults>,
  KnowledgeTestResults
>('api/knowledgeTests/results', async (knowledgeTestResults, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('knowledgetests/user/answers', {
      json: {
        data: {
          knowledge_test_id: knowledgeTestResults.knowledgeTestId,
          results: knowledgeTestResults.results.map((result) => ({
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
    return data as ApiPayload<KnowledgeTestResults>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const knowledgeTestResultsSlice = createSlice({
  name: 'knowledgeTestResults',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.knowledgeTestResults,
        });
      })

      .addCase(sendKnowledgeTestResults.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        sendKnowledgeTestResults.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<KnowledgeTestResults> }
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
      .addCase(sendKnowledgeTestResults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectKnowledgeTestResultsData = (state: RootState) =>
  state.knowledgeTestResults.data;
export const selectKnowledgeTestResultsError = (state: RootState) =>
  state.knowledgeTestResults.error;
export const selectKnowledgeTestResultsStatus = (state: RootState) =>
  state.knowledgeTestResults.status;

export default knowledgeTestResultsSlice.reducer;
