import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../apiClient';
import { RootState } from '../../store';
import { Answer } from '../../models/Answer';
import { HYDRATE } from 'next-redux-wrapper';

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

export const createAnswer = createAsyncThunk(
  'api/answers/create',
  async (
    {
      lessonId,
      finalAnswer,
    }: {
      lessonId: string;
      finalAnswer: string;
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('answers', {
        json: {
          data: {
            id_lesson: lessonId,
            final_answer: finalAnswer,
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
      .addCase(createAnswer.fulfilled, (state, { payload }) => {
        state.data = [...state.data, payload.data];
      })
      .addCase(createAnswer.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const selectAnswerData = (state: RootState) => state.answers.data;
export const selectAnswerError = (state: RootState) => state.answers.error;
export const selectAnswerStatus = (state: RootState) => state.answers.status;

export default answersSlice.reducer;
