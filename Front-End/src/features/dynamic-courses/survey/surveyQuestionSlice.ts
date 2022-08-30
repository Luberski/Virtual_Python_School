import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

export type SurveyQuestionState = {
  data: {
    id: number;
    survey_id: number;
    question: string;
  };
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: SurveyQuestionState = {
  data: null,
  status: 'idle',
  error: null,
};

export const createSurveyQuestion = createAsyncThunk(
  'api/surveys/questions/create',
  async (
    { surveyId, question }: { surveyId: number; question: string },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('dynamic-courses/surveys/questions', {
        json: {
          data: {
            survey_id: surveyId,
            question,
          },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const surveyQuestionSlice = createSlice({
  name: 'surveyQuestion',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.surveyQuestion,
        });
      })

      .addCase(createSurveyQuestion.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createSurveyQuestion.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload | any }
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
      .addCase(createSurveyQuestion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectSurveyQuestionData = (state: RootState) =>
  state.surveyQuestion.data;
export const selectSurveyQuestionError = (state: RootState) =>
  state.surveyQuestion.error;
export const selectSurveyQuestionStatus = (state: RootState) =>
  state.surveyQuestion.status;

export default surveyQuestionSlice.reducer;
