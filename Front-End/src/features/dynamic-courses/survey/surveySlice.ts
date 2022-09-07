import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import type Survey from '@app/models/Survey';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type SurveyState = {
  data: Survey;
  status: ApiStatus;
  error: string | null;
};

const initialState: SurveyState = {
  data: {
    id: null,
    name: null,
    featured: true,
    questions: [],
  },
  status: 'idle',
  error: null,
};

export const createSurvey = createAsyncThunk<
  ApiPayload<Survey>,
  {
    name: string;
  }
>('api/surveys/create', async ({ name }, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.post('surveys', {
      json: {
        data: {
          name,
          featured: state.survey.data.featured,
        },
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<Survey>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const fetchSurvey = createAsyncThunk<ApiPayload<Survey>, number>(
  'api/surveys',
  async (id, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`surveys/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      return data as ApiPayload<Survey>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const fetchFeaturedSurvey = createAsyncThunk<ApiPayload<Survey>>(
  'api/surveys/featured',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`survey/featured`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      return data as ApiPayload<Survey>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    setSurveyAsFeatured: (state, { payload }: PayloadAction<boolean>) => {
      state.data.featured = payload;
    },
  },
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
          { payload: { data, error } }: { payload: ApiPayload<Survey> }
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
          { payload: { data, error } }: { payload: ApiPayload<Survey> }
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
      })
      .addCase(createSurvey.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createSurvey.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Survey> }
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
      .addCase(createSurvey.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectSurveyData = (state: RootState) => state.survey.data;
export const selectSurveyError = (state: RootState) => state.survey.error;
export const selectSurveyStatus = (state: RootState) => state.survey.status;

export const { setSurveyAsFeatured } = surveySlice.actions;

export default surveySlice.reducer;
