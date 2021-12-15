import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";
import type { RootState } from "../../store";
import { ApiPayload } from "../../models/ApiPayload";

interface PlaygroundPayload extends ApiPayload {
  data: { content: string };
}

export type PlaygroundState = {
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
};

const initialState: PlaygroundState = {
  status: "idle",
  error: null,
};

export const sendCode = createAsyncThunk(
  "api/playground",
  async ({ content }: { content: string }) => {
    try {
      const res = await apiClient.post("/playground", { data: { content } });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
);

export const playgroundSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(sendCode.pending, (state, _action) => {
        state.status = "pending";
      })
      // TODO: recieve token
      .addCase(
        sendCode.fulfilled,
        (state, { payload: { data } }: { payload: PlaygroundPayload }) => {
          state.status = "succeeded";
        }
      )
      // TODO: handle errors from api response
      .addCase(sendCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectPlaygroundError = (state: RootState) =>
  state.playground.error;
export const selectPlaygroundStatus = (state: RootState) =>
  state.playground.status;

export default playgroundSlice.reducer;
