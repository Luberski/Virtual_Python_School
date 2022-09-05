import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type SurveyResults from '@app/models/SurveyResults';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

export type SurveyResultsState = {
  data: SurveyResults;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: SurveyResultsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const sendSurveyResults = createAsyncThunk<
  ApiPayload<SurveyResults>,
  SurveyResults
>('api/surveys/results', async (surveyResults, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('surveys/user/answers', {
      json: {
        data: {
          survey_id: surveyResults.surveyId,
          survey_results: surveyResults.surveyResults.map((result) => ({
            question_id: result.questionId,
            answer_id: result.answerId,
          })),
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<SurveyResults>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const surveyResultsSlice = createSlice({
  name: 'surveyResults',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.surveyResults });
      })

      .addCase(sendSurveyResults.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        sendSurveyResults.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<SurveyResults> }
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
      .addCase(sendSurveyResults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectSurveyResultsData = (state: RootState) =>
  state.surveyResults.data;
export const selectSurveyResultsError = (state: RootState) =>
  state.surveyResults.error;
export const selectSurveyResultsStatus = (state: RootState) =>
  state.surveyResults.status;

export default surveyResultsSlice.reducer;
