import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type GlobalKnowledgeTest from '@app/models/GlobalKnowledgeTest';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type GlobalKnowledgeTestState = {
  data: GlobalKnowledgeTest;
  status: ApiStatus;
  error: string | null;
};

const initialState: GlobalKnowledgeTestState = {
  data: null,
  status: 'idle',
  error: null,
};

export const createGlobalKnowledgeTest = createAsyncThunk<
  ApiPayload<GlobalKnowledgeTest>,
  {
    name: string;
  }
>('api/globalknowledgetests/create', async ({ name }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('globalknowledgetests', {
      json: {
        data: {
          name,
        },
      },
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

export const fetchGlobalKnowledgeTest = createAsyncThunk<
  ApiPayload<GlobalKnowledgeTest>,
  number
>('api/globalknowledgetests', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`globalknowledgetests/${id}`, {
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

export const fetchFeaturedGlobalKnowledgeTest = createAsyncThunk<
  ApiPayload<GlobalKnowledgeTest>
>('api/globalknowledgetest/featured', async (_: void, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`globalknowledgetest/featured`, {
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

export const globalKnowledgeTestSlice = createSlice({
  name: 'globalKnowledgeTest',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        return Object.assign({}, state, {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...action.payload.globalKnowledgeTest,
        });
      })
      .addCase(fetchGlobalKnowledgeTest.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchGlobalKnowledgeTest.fulfilled,
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
            state.data = data;
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(fetchGlobalKnowledgeTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createGlobalKnowledgeTest.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createGlobalKnowledgeTest.fulfilled,
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
            state.data = data;
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(createGlobalKnowledgeTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchFeaturedGlobalKnowledgeTest.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchFeaturedGlobalKnowledgeTest.fulfilled,
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
            state.data = data;
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(fetchFeaturedGlobalKnowledgeTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectGlobalKnowledgeTestData = (state: RootState) =>
  state.globalKnowledgeTest.data;
export const selectGlobalKnowledgeTestError = (state: RootState) =>
  state.globalKnowledgeTest.error;
export const selectGlobalKnowledgeTestStatus = (state: RootState) =>
  state.globalKnowledgeTest.status;

export default globalKnowledgeTestSlice.reducer;
