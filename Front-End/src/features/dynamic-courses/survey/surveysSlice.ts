import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type Survey from '@app/models/Survey';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

export type SurveysState = {
  data: Survey[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: SurveysState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchSurveys = createAsyncThunk(
  'api/surveys/all',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`surveys`, {
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

export const deleteSurvey = createAsyncThunk(
  'api/surveys/delete',
  async (id: number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.delete(`surveys/${id}`, {
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

export const surveysSlice = createSlice({
  name: 'surveys',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.surveys });
      })
      .addCase(fetchSurveys.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchSurveys.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload | any }
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
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteSurvey.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        deleteSurvey.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload | any }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.data = [...state.data.filter((s) => s.id !== data.id)];
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(deleteSurvey.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectSurveysData = (state: RootState) => state.surveys.data;
export const selectSurveysError = (state: RootState) => state.surveys.error;
export const selectSurveysStatus = (state: RootState) => state.surveys.status;

export default surveysSlice.reducer;
