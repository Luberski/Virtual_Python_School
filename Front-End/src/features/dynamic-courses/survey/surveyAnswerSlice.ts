import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';
import type { RuleType } from '@app/models/SurveyAnswer';

export type AnswerData = {
  id?: number;
  question_id?: number;
  name: string;
  rule_type: RuleType;
  rule_value: number;
};

export type SurveyAnswerState = {
  data: AnswerData;
  answers: AnswerData[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: SurveyAnswerState = {
  data: null,
  answers: [],
  status: 'idle',
  error: null,
};

export const createSurveyAnswer = createAsyncThunk<
  ApiPayload<AnswerData>,
  {
    questionId: number;
    name: string;
    ruleType: RuleType;
    ruleValue: number;
  }
>(
  'api/surveys/answers/create',
  async ({ questionId, name, ruleType, ruleValue }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('surveys/answers', {
        json: {
          data: {
            question_id: questionId,
            name: name,
            rule_type: ruleType,
            rule_value: ruleValue,
          },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<AnswerData>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const surveyAnswerSlice = createSlice({
  name: 'surveyAnswer',
  initialState,
  reducers: {
    addSurveyAnswer: (state, { payload }: PayloadAction<AnswerData>) => {
      state.answers = [...state.answers, payload];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.surveyAnswer,
        });
      })
      .addCase(createSurveyAnswer.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createSurveyAnswer.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<AnswerData> }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.data = data;
            state.answers.push(data);
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(createSurveyAnswer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectSurveyAnswerData = (state: RootState) =>
  state.surveyAnswer.data;
export const selectSurveyAnswers = (state: RootState) =>
  state.surveyAnswer.answers;
export const selectSurveyAnswerError = (state: RootState) =>
  state.surveyAnswer.error;
export const selectSurveyAnswerStatus = (state: RootState) =>
  state.surveyAnswer.status;

export const { addSurveyAnswer } = surveyAnswerSlice.actions;

export default surveyAnswerSlice.reducer;
