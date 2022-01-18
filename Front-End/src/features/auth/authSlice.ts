import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";
import type { RootState } from "../../store";
import { User } from "../../models/User";
import { ApiPayload } from "../../models/ApiPayload";
import { Token } from "../../models/Token";
import { HYDRATE } from "next-redux-wrapper";

interface AuthPayload extends ApiPayload {
  data: User & { token: Token };
}

export type AuthState = {
  token: Token | null;
  user: User | null;
  isLoggedIn: boolean;
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AuthState = {
  token: null,
  isLoggedIn: false,
  user: null,
  status: "idle",
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      const res = await apiClient.post("/login", formData);
      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
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
  },
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // @ts-ignore
        console.log("HYDRATE", state, action.payload);
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.auth });
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "pending";
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
          };
          state.token = {
            accessToken: data.token["access_token"],
            refreshToken: data.token["refresh_token"],
          };
          state.isLoggedIn = true;
          state.status = "succeeded";
        }
      )
      // TODO: handle errors from api response
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsLogged = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;
