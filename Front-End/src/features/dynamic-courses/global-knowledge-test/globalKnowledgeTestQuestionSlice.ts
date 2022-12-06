import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

type QuestionData = {
  _id?: string;
  id?: number;
  global_knowledge_test_id: number;
  question: string;
  answer: string;
  lesson_id: number;
};

type CreateGlobalKnowledgeTestQuestionsResponse = ApiPayload & {
  data: {
    questions: QuestionData[];
  };
};

export type GlobalKnowledgeTestQuestionState = {
  data: QuestionData | CreateGlobalKnowledgeTestQuestionsResponse;
  questions: QuestionData[];
  status: ApiStatus;
  error: string | null;
};

const initialState: GlobalKnowledgeTestQuestionState = {
  data: null,
  questions: [],
  status: 'idle',
  error: null,
};

export const createGlobalKnowledgeTestQuestion = createAsyncThunk<
  ApiPayload<QuestionData>,
  {
    globalKnowledgeTestId: number;
    question: string;
    answer: string;
    lessonId: number;
  }
>(
  'api/globalKnowledgeTests/questions/create',
  async ({ globalKnowledgeTestId, question, answer, lessonId }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('globalknowledgetests/questions', {
        json: {
          data: {
            global_knowledge_test_id: globalKnowledgeTestId,
            question,
            answer,
            lesson_id: lessonId,
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

export const createGlobalKnowledgeTestQuestions =
  createAsyncThunk<CreateGlobalKnowledgeTestQuestionsResponse>(
    'api/globalKnowledgeTests/questions/create/bulk',
    async (_: void, thunkApi) => {
      try {
        const state = thunkApi.getState() as RootState;
        const { accessToken } = state.auth.token;
        const res = await apiClient.post('globalknowledgetests/questions', {
          json: {
            data: {
              global_knowledge_test_id: state.globalKnowledgeTest.data.id,
              bulk: true,
              questions: state.globalKnowledgeTestQuestion.questions.map(
                (question) => {
                  return {
                    question: question.question,
                    answer: question.answer,
                    lesson_id: question.lesson_id,
                  };
                }
              ),
            },
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        return data as CreateGlobalKnowledgeTestQuestionsResponse;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  );

export const createGlobalKnowledgeTestQuestionWithAnswer = createAsyncThunk<
  ApiPayload<QuestionData>,
  { question: string; answer: string; lessonId: number }
>(
  'api/globalKnowledgeTests/questions/answers/create',
  async ({ question, answer, lessonId }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('globalknowledgetests/questions', {
        json: {
          data: {
            global_knowledge_test_id: state.globalKnowledgeTest.data.id,
            question,
            answer,
            lesson_id: lessonId,
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

export const createGlobalKnowledgeTestQuestionsWithAnswers = createAsyncThunk(
  'api/globalKnowledgeTests/questions/answers/create/bulk',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const questions = state.globalKnowledgeTestQuestion.questions.map(
        (question) =>
          thunkApi.dispatch(
            createGlobalKnowledgeTestQuestionWithAnswer({
              question: question.question,
              answer: question.answer,
              lessonId: question.lesson_id,
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

export const globalKnowledgeTestQuestionSlice = createSlice({
  name: 'globalKnowledgeTestQuestion',
  initialState,
  reducers: {
    addGlobalKnowledgeTestQuestion: (
      state,
      { payload }: PayloadAction<QuestionData>
    ) => {
      state.questions = [...state.questions, payload];
    },
    removeGlobalKnowledgeTestQuestion: (
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
          ...action.payload.globalKnowledgeTestQuestion,
        });
      })

      .addCase(createGlobalKnowledgeTestQuestion.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createGlobalKnowledgeTestQuestion.fulfilled,
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
      .addCase(createGlobalKnowledgeTestQuestion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createGlobalKnowledgeTestQuestions.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createGlobalKnowledgeTestQuestions.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: CreateGlobalKnowledgeTestQuestionsResponse }
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
      .addCase(createGlobalKnowledgeTestQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectGlobalKnowledgeTestQuestionData = (state: RootState) =>
  state.globalKnowledgeTestQuestion.data;
export const selectGlobalKnowledgeTestQuestions = (state: RootState) =>
  state.globalKnowledgeTestQuestion.questions;
export const selectGlobalKnowledgeTestQuestionError = (state: RootState) =>
  state.globalKnowledgeTestQuestion.error;
export const selectGlobalKnowledgeTestQuestionStatus = (state: RootState) =>
  state.globalKnowledgeTestQuestion.status;

export const {
  addGlobalKnowledgeTestQuestion,
  removeGlobalKnowledgeTestQuestion,
} = globalKnowledgeTestQuestionSlice.actions;

export default globalKnowledgeTestQuestionSlice.reducer;
