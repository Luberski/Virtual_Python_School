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
  knowledge_test_id: number;
  question: string;
  answer: string;
};

type CreateKnowledgeTestQuestionsResponse = ApiPayload & {
  data: {
    questions: QuestionData[];
  };
};

export type KnowledgeTestQuestionState = {
  data: QuestionData | CreateKnowledgeTestQuestionsResponse;
  questions: QuestionData[];
  status: ApiStatus;
  error: string | null;
};

const initialState: KnowledgeTestQuestionState = {
  data: null,
  questions: [],
  status: 'idle',
  error: null,
};

export const createKnowledgeTestQuestion = createAsyncThunk<
  ApiPayload<QuestionData>,
  { knowledgeTestId: number; question: string }
>(
  'api/knowledgeTests/questions/create',
  async ({ knowledgeTestId, question }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('knowledgetests/questions', {
        json: {
          data: {
            knowledge_test_id: knowledgeTestId,
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
  }
);

export const createKnowledgeTestQuestions =
  createAsyncThunk<CreateKnowledgeTestQuestionsResponse>(
    'api/knowledgeTests/questions/create/bulk',
    async (_: void, thunkApi) => {
      try {
        const state = thunkApi.getState() as RootState;
        const { accessToken } = state.auth.token;
        const res = await apiClient.post('knowledgetests/questions', {
          json: {
            data: {
              knowledge_test_id: state.knowledgeTest.data.id,
              bulk: true,
              questions: state.knowledgeTestQuestion.questions.map(
                ({ question }) => question
              ),
            },
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        return data as CreateKnowledgeTestQuestionsResponse;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  );

export const createKnowledgeTestQuestionWithAnswer = createAsyncThunk<
  ApiPayload<QuestionData>,
  { question: string; answer: string }
>(
  'api/knowledgeTests/questions/answers/create',
  async ({ question, answer }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('knowledgetests/questions', {
        json: {
          data: {
            knowledge_test_id: state.knowledgeTest.data.id,
            question,
            answer,
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

export const createKnowledgeTestQuestionsWithAnswers = createAsyncThunk(
  'api/knowledgeTests/questions/answers/create/bulk',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const questions = state.knowledgeTestQuestion.questions.map((question) =>
        thunkApi.dispatch(
          createKnowledgeTestQuestionWithAnswer({
            question: question.question,
            answer: question.answer,
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

export const knowledgeTestQuestionSlice = createSlice({
  name: 'knowledgeTestQuestion',
  initialState,
  reducers: {
    addKnowledgeTestQuestion: (
      state,
      { payload }: PayloadAction<QuestionData>
    ) => {
      state.questions = [...state.questions, payload];
    },
    removeKnowledgeTestQuestion: (
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
          ...action.payload.knowledgeTestQuestion,
        });
      })

      .addCase(createKnowledgeTestQuestion.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createKnowledgeTestQuestion.fulfilled,
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
      .addCase(createKnowledgeTestQuestion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createKnowledgeTestQuestions.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createKnowledgeTestQuestions.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: CreateKnowledgeTestQuestionsResponse }
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
      .addCase(createKnowledgeTestQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectKnowledgeTestQuestionData = (state: RootState) =>
  state.knowledgeTestQuestion.data;
export const selectKnowledgeTestQuestions = (state: RootState) =>
  state.knowledgeTestQuestion.questions;
export const selectKnowledgeTestQuestionError = (state: RootState) =>
  state.knowledgeTestQuestion.error;
export const selectKnowledgeTestQuestionStatus = (state: RootState) =>
  state.knowledgeTestQuestion.status;

export const { addKnowledgeTestQuestion, removeKnowledgeTestQuestion } =
  knowledgeTestQuestionSlice.actions;

export default knowledgeTestQuestionSlice.reducer;
