import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';

type AnswerData = { id: string; status: boolean; lesson_id: string };

export type AnswerState = {
  data: AnswerData;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AnswerState = {
  data: null,
  status: 'idle',
  error: null,
};

export const checkAnswer = createAsyncThunk<
  ApiPayload<AnswerData>,
  {
    lessonId: number;
    enrolledLessonId: number;
    answer: string;
  }
>(
  'api/answer/check',
  async ({ lessonId, enrolledLessonId, answer }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('answers/check', {
        json: {
          data: {
            lesson_id: lessonId,
            enrolled_lesson_id: enrolledLessonId,
            answer: answer,
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

export const answerSlice = createSlice({
  name: 'answer',
  initialState,
  reducers: {
    reset: () => {
      return initialState;
    },
  },
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
      .addCase(
        checkAnswer.fulfilled,
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
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
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
