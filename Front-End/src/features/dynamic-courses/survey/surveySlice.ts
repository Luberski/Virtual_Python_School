import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type Survey from '@app/models/Survey';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { ApiPayload } from '@app/models/ApiPayload';

export type SurveyState = {
  data: Survey;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: SurveyState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchSurvey = createAsyncThunk(
  'api/dynamic-courses/surveys',
  async (id: number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`dynamic-courses/surveys/${id}`, {
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

export const fetchFeaturedSurvey = createAsyncThunk(
  'api/dynamic-courses/surveys/featured',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`dynamic-courses/survey/featured`, {
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

export const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.survey });
      })
      .addCase(fetchSurvey.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchSurvey.fulfilled,
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
      .addCase(fetchSurvey.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchFeaturedSurvey.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchFeaturedSurvey.fulfilled,
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
      .addCase(fetchFeaturedSurvey.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectSurveyData = (state: RootState) => state.survey.data;
export const selectSurveyError = (state: RootState) => state.survey.error;
export const selectSurveyStatus = (state: RootState) => state.survey.status;

export default surveySlice.reducer;
