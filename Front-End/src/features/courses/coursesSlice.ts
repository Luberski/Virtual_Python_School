import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";
import { RootState } from "../../store";
import { Course } from "../../models/Course";

export type CourseState = {
  data: Course[];
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
};

const initialState: CourseState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchCourses = createAsyncThunk(
  "api/courses",
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get("/courses", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "pending";
      })
      .addCase(
        fetchCourses.fulfilled,
        (state, { payload: { data, error } }) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = "failed";
          } else {
            state.data = data;
            state.error = null;
            state.status = "succeeded";
          }
        }
      )
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectCoursesData = (state: RootState) => state.courses.data;
export const selectCoursesError = (state: RootState) => state.courses.error;
export const selectCoursesStatus = (state: RootState) => state.courses.status;

export default coursesSlice.reducer;
