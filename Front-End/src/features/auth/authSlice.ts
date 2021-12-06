import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";
import type { RootState } from "../../store";
import { User } from "../../models/User";
import { ApiPayload } from "../../models/ApiPayload";

interface AuthPayload extends ApiPayload {
  data: User;
}

export type AuthState = {
  token: string | null;
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
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await apiClient.post("/login", {
        email: email,
        password: password,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loginUser.pending, (state, _action) => {
        state.status = "pending";
      })
      // TODO: recieve token
      .addCase(
        loginUser.fulfilled,
        (state, { payload: { data } }: { payload: AuthPayload }) => {
          state.user.id = data.id;
          state.user.zutId = data.zutId;
          state.user.email = data.email;
          state.user.name = data.name;
          state.user.lastName = data.lastName;
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

export default authSlice.reducer;
