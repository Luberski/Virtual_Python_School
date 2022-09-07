import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Answer from '@app/models/Answer';
import type ApiPayload from '@app/models/ApiPayload';

export type AnswersState = {
  data: Answer[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AnswersState = {
  data: null,
  status: 'idle',
  error: null,
};

export const createAnswer = createAsyncThunk<
  ApiPayload<Answer>,
  {
    lessonId: string;
    finalAnswer: string;
  }
>('api/answers/create', async ({ lessonId, finalAnswer }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('answers', {
      json: {
        data: {
          lesson_id: lessonId,
          final_answer: finalAnswer,
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<Answer>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const answersSlice = createSlice({
  name: 'answers',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.answers });
      })
      .addCase(createAnswer.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createAnswer.fulfilled,
        (state, { payload }: { payload: ApiPayload<Answer> }) => {
          state.data = [...state.data, payload.data];
        }
      )
      .addCase(createAnswer.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const selectAnswerData = (state: RootState) => state.answers.data;
export const selectAnswerError = (state: RootState) => state.answers.error;
export const selectAnswerStatus = (state: RootState) => state.answers.status;

export default answersSlice.reducer;
