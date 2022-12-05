import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type KnowledgeTest from '@app/models/KnowledgeTest';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type KnowledgeTestsState = {
  data: KnowledgeTest[];
  status: ApiStatus;
  error: string | null;
};

const initialState: KnowledgeTestsState = {
  data: [],
  status: 'idle',
  error: null,
};

export const fetchKnowledgeTests = createAsyncThunk<
  ApiPayload<KnowledgeTest[]>
>('api/knowledgeTests/all', async (_: void, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`knowledgetests`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<KnowledgeTest[]>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const deleteKnowledgeTest = createAsyncThunk<
  ApiPayload<KnowledgeTest>,
  number
>('api/knowledgeTests/delete', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.delete(`knowledgetests/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<KnowledgeTest>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const deleteKnowledgeTestByLessonId = createAsyncThunk<
  ApiPayload<KnowledgeTest>,
  number
>('api/knowledgeTests/delete/by/lessonId', async (lessonId, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.delete(`knowledgetests/lesson/${lessonId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<KnowledgeTest>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const knowledgeTestsSlice = createSlice({
  name: 'knowledgeTests',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.knowledgeTests });
      })
      .addCase(fetchKnowledgeTests.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchKnowledgeTests.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<KnowledgeTest[]> }
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
      .addCase(fetchKnowledgeTests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteKnowledgeTest.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        deleteKnowledgeTest.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<KnowledgeTest> }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.data = state.data.filter((test) => test.id !== data.id);
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(deleteKnowledgeTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteKnowledgeTestByLessonId.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        deleteKnowledgeTestByLessonId.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<KnowledgeTest> }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.data = state.data.filter((test) => test.id !== data.id);
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(deleteKnowledgeTestByLessonId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectKnowledgeTestsData = (state: RootState) =>
  state.knowledgeTests.data;
export const selectKnowledgeTestsError = (state: RootState) =>
  state.knowledgeTests.error;
export const selectKnowledgeTestsStatus = (state: RootState) =>
  state.knowledgeTests.status;

export default knowledgeTestsSlice.reducer;
