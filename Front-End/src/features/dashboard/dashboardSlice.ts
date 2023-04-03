import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Dashboard from '@app/models/Dashboard';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type DashboardState = {
  data: Dashboard;
  status: ApiStatus;
  error: string | null;
};

const initialState: DashboardState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchDashboard = createAsyncThunk<ApiPayload<Dashboard>>(
  'api/dashboard',
  async (_, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`dashboard`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      return data as ApiPayload<Dashboard>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.dashboard });
      })
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchDashboard.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Dashboard> }
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
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardStatus = (state: RootState) =>
  state.dashboard.status;

export default dashboardSlice.reducer;
