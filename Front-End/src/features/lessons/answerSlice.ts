import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../apiClient';
import { RootState } from '../../store';
import { HYDRATE } from 'next-redux-wrapper';

export type AnswerState = {
  // TODO: move types to models folder
  data: { id: string; status: boolean; id_lesson: string };
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AnswerState = {
  data: null,
  status: 'idle',
  error: null,
};

export const checkAnswer = createAsyncThunk(
  'api/answer/check',
  async (
    {
      lessonId,
      answer,
    }: {
      lessonId: string;
      answer: string;
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post(
        '/answers/check',
        {
          data: {
            id_lesson: lessonId,
            answer: answer,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const answerSlice = createSlice({
  name: 'answer',
  initialState,
  reducers: { reset: (state) => Object.assign(state, initialState) },
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.answer });
      })
      .addCase(checkAnswer.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(checkAnswer.fulfilled, (state, { payload: { data, error } }) => {
        if (error) {
          state.data = null;
          state.error = error;
          state.status = 'failed';
        } else {
          state.data = data;
          state.error = null;
          state.status = 'succeeded';
        }
      })
      .addCase(checkAnswer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectAnswerData = (state: RootState) => state.answer.data;
export const selectAnswerError = (state: RootState) => state.answer.error;
export const selectAnswerStatus = (state: RootState) => state.answer.status;
export const { reset } = answerSlice.actions;
export default answerSlice.reducer;
