import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type KnowledgeTest from '@app/models/KnowledgeTest';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type KnowledgeTestState = {
  data: KnowledgeTest;
  featured: boolean;
  status: ApiStatus;
  error: string | null;
};

const initialState: KnowledgeTestState = {
  data: null,
  featured: true,
  status: 'idle',
  error: null,
};

export const createKnowledgeTest = createAsyncThunk<
  ApiPayload<KnowledgeTest>,
  {
    name: string;
    lessonId: number;
  }
>('api/knowledgetests/create', async ({ name, lessonId }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('knowledgetests', {
      json: {
        data: {
          name,
          lesson_id: lessonId,
        },
      },
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

export const fetchKnowledgeTest = createAsyncThunk<
  ApiPayload<KnowledgeTest>,
  number
>('api/knowledgetests', async (id, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`knowledgetests/${id}`, {
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

export const fetchKnowledgeTestByLessonId = createAsyncThunk<
  ApiPayload<KnowledgeTest>,
  number
>('api/knowledgetests/by/lessonId', async (lessonId, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`knowledgetests/lesson/${lessonId}`, {
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

export const knowledgeTestSlice = createSlice({
  name: 'knowledgeTest',
  initialState,
  reducers: {
    setKnowledgeTestAsFeatured: (
      state,
      { payload }: PayloadAction<boolean>
    ) => {
      state.featured = payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.knowledgeTest });
      })
      .addCase(fetchKnowledgeTest.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchKnowledgeTest.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<KnowledgeTest> }
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
      .addCase(fetchKnowledgeTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createKnowledgeTest.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createKnowledgeTest.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<KnowledgeTest> }
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
      .addCase(createKnowledgeTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchKnowledgeTestByLessonId.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchKnowledgeTestByLessonId.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<KnowledgeTest> }
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
      .addCase(fetchKnowledgeTestByLessonId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.data = null;
      });
  },
});

export const selectKnowledgeTestData = (state: RootState) =>
  state.knowledgeTest.data;
export const selectKnowledgeTestError = (state: RootState) =>
  state.knowledgeTest.error;
export const selectKnowledgeTestStatus = (state: RootState) =>
  state.knowledgeTest.status;

export const { setKnowledgeTestAsFeatured } = knowledgeTestSlice.actions;

export default knowledgeTestSlice.reducer;
