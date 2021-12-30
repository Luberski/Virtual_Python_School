import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";
import type { RootState } from "../../store";
import { ApiPayload } from "../../models/ApiPayload";
import { Playground } from "../../models/Playground";

interface PlaygroundPayload extends ApiPayload {
  data: { content: string | null };
  error: string | null;
}

export type PlaygroundState = {
  data: Playground;
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
};

const initialState: PlaygroundState = {
  data: null,
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
      .addCase(sendCode.fulfilled, (state, { payload: { data, error } }) => {
        if (error) {
          state.data = {
            content: null,
          };
          state.error = error;
          state.status = "failed";
        } else {
          state.data = {
            content: data?.content,
          };
          state.error = null;
          state.status = "succeeded";
        }
      })
      .addCase(sendCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
export const selectPlaygroundData = (state: RootState) => state.playground.data;
export const selectPlaygroundError = (state: RootState) =>
  state.playground.error;
export const selectPlaygroundStatus = (state: RootState) =>
  state.playground.status;

export default playgroundSlice.reducer;
