import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type GlobalKnowledgeTest from '@app/models/GlobalKnowledgeTest';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type GlobalKnowledgeTestsState = {
  data: GlobalKnowledgeTest[];
  status: ApiStatus;
  error: string | null;
};

const initialState: GlobalKnowledgeTestsState = {
  data: [],
  status: 'idle',
  error: null,
};

export const fetchGlobalKnowledgeTests = createAsyncThunk<
  ApiPayload<GlobalKnowledgeTest[]>
>('api/globalKnowledgeTests/all', async (_: void, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`globalknowledgetests`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<GlobalKnowledgeTest[]>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const deleteGlobalKnowledgeTest = createAsyncThunk<
  ApiPayload<GlobalKnowledgeTest>,
  number
>('api/globalKnowledgeTests/delete', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.delete(`globalknowledgetests/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    return data as ApiPayload<GlobalKnowledgeTest>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const globalKnowledgeTestsSlice = createSlice({
  name: 'globalKnowledgeTests',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.globalKnowledgeTests,
        });
      })
      .addCase(fetchGlobalKnowledgeTests.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchGlobalKnowledgeTests.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<GlobalKnowledgeTest[]> }
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
      .addCase(fetchGlobalKnowledgeTests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteGlobalKnowledgeTest.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        deleteGlobalKnowledgeTest.fulfilled,
        (
          state,
          {
            payload: { data, error },
          }: { payload: ApiPayload<GlobalKnowledgeTest> }
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
      .addCase(deleteGlobalKnowledgeTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectGlobalKnowledgeTestsData = (state: RootState) =>
  state.globalKnowledgeTests.data;
export const selectGlobalKnowledgeTestsError = (state: RootState) =>
  state.globalKnowledgeTests.error;
export const selectGlobalKnowledgeTestsStatus = (state: RootState) =>
  state.globalKnowledgeTests.status;

export default globalKnowledgeTestsSlice.reducer;
