import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type { AnswerData } from './surveyAnswerSlice';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

type QuestionData = {
  _id?: string;
  id?: number;
  survey_id: number;
  question: string;
  answers: AnswerData[];
};

type CreateSurveyQuestionsResponse = ApiPayload & {
  data: {
    questions: QuestionData[];
  };
};

export type SurveyQuestionState = {
  data: QuestionData | CreateSurveyQuestionsResponse;
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

export const createSurveyQuestion = createAsyncThunk<
  ApiPayload<QuestionData>,
  { surveyId: number; question: string }
>('api/surveys/questions/create', async ({ surveyId, question }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('surveys/questions', {
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
    return data as ApiPayload<QuestionData>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const createSurveyQuestions =
  createAsyncThunk<CreateSurveyQuestionsResponse>(
    'api/surveys/questions/create/bulk',
    async (_: void, thunkApi) => {
      try {
        const state = thunkApi.getState() as RootState;
        const { accessToken } = state.auth.token;
        const res = await apiClient.post('surveys/questions', {
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
        return data as CreateSurveyQuestionsResponse;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  );

export const createSurveyQuestionWithAnswers = createAsyncThunk<
  ApiPayload<QuestionData>,
  { question: string; answers: AnswerData[] }
>(
  'api/surveys/questions/answers/create',
  async ({ question, answers }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('surveys/question', {
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
      return data as ApiPayload<QuestionData>;
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
      await Promise.all(questions);
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
    removeSurveyQuestion: (
      state,
      {
        payload,
      }: PayloadAction<{
        _id: string;
      }>
    ) => {
      state.questions = state.questions.filter(
        (question) => question._id !== payload._id
      );
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
          { payload: { data, error } }: { payload: ApiPayload<QuestionData> }
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
          {
            payload: { data, error },
          }: { payload: CreateSurveyQuestionsResponse }
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

export const { addSurveyQuestion, removeSurveyQuestion } =
  surveyQuestionSlice.actions;

export default surveyQuestionSlice.reducer;
