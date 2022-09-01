import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type { AnswerData } from './surveyAnswerSlice';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

type QuestionData = {
  id?: number;
  survey_id: number;
  question: string;
  answers: AnswerData[];
};

export type SurveyQuestionState = {
  data: QuestionData;
  questions: QuestionData[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: SurveyQuestionState = {
  data: null,
  questions: [],
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

export const createSurveyQuestions = createAsyncThunk(
  'api/surveys/questions/create/bulk',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('dynamic-courses/surveys/questions', {
        json: {
          data: {
            survey_id: state.survey.data.id,
            bulk: true,
            questions: state.surveyQuestion.questions.map(
              ({ question }) => question
            ),
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

export const createSurveyQuestionWithAnswers = createAsyncThunk(
  'api/surveys/questions/answers/create',
  async (
    { question, answers }: { question: string; answers: AnswerData[] },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('dynamic-courses/surveys/question', {
        json: {
          data: {
            survey_id: state.survey.data.id,
            question,
            answers,
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

export const createSurveyQuestionsWithAnswers = createAsyncThunk(
  'api/surveys/questions/answers/create/bulk',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const questions = state.surveyQuestion.questions.map((question) =>
        thunkApi.dispatch(
          createSurveyQuestionWithAnswers({
            question: question.question,
            answers: question.answers,
          })
        )
      );
      const res = await Promise.all(questions);
      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const surveyQuestionSlice = createSlice({
  name: 'surveyQuestion',
  initialState,
  reducers: {
    addSurveyQuestion: (state, { payload }: PayloadAction<QuestionData>) => {
      state.questions = [...state.questions, payload];
    },
  },
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
            state.questions.push(data);
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(createSurveyQuestion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createSurveyQuestions.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createSurveyQuestions.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload | any }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.questions.push(...data.questions);
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(createSurveyQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectSurveyQuestionData = (state: RootState) =>
  state.surveyQuestion.data;
export const selectSurveyQuestions = (state: RootState) =>
  state.surveyQuestion.questions;
export const selectSurveyQuestionError = (state: RootState) =>
  state.surveyQuestion.error;
export const selectSurveyQuestionStatus = (state: RootState) =>
  state.surveyQuestion.status;

export const { addSurveyQuestion } = surveyQuestionSlice.actions;

export default surveyQuestionSlice.reducer;
