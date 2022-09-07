import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { setCookies } from 'cookies-next';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type User from '@app/models/User';
import type ApiPayload from '@app/models/ApiPayload';
import type Token from '@app/models/Token';

interface AuthPayload extends ApiPayload {
  data: User & { token: Token };
}

export type AuthState = {
  token: Token | null;
  user: User | null;
  isLoggedIn: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AuthState = {
  token: null,
  isLoggedIn: false,
  user: null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthPayload,
  { username: string; password: string }
>('auth/login', async ({ username, password }) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const res = await apiClient.post('login', {
      body: formData,
    });

    const data = await res.json();
    return data as AuthPayload;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      const token = {
        accessToken,
        refreshToken,
      };
      state.token = token;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      setCookies('token', '');
      setCookies('accessToken', '');
      setCookies('refreshToken', '');
      setCookies('user', '');
      setCookies('isLoggedIn', '');
    },
  },
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.auth });
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        loginUser.fulfilled,
        (state, { payload: { data } }: { payload: AuthPayload }) => {
          state.user = {
            id: data.id,
            zutID: data.zutID,
            username: data.username,
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            roleId: data.roleId,
          };
          state.token = {
            accessToken: data.token['access_token'],
            refreshToken: data.token['refresh_token'],
          };
          state.isLoggedIn = true;
          state.status = 'succeeded';
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      });
  },
});

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsLogged = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
