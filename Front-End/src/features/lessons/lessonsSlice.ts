import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../apiClient';
import { RootState } from '../../store';
import { Lesson } from '../../models/Lesson';
import { HYDRATE } from 'next-redux-wrapper';

export type LessonState = {
  data: Lesson[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: LessonState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchLessons = createAsyncThunk(
  'api/lessons',
  async (courseId: string, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get('/lessons', {
        params: {
          id_course: courseId,
        },
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

// TODO: handle errors
export const deleteLesson = createAsyncThunk(
  'api/lessons/delete',
  async (id: string | number, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.delete(`/lessons`, {
        data: {
          data: {
            id_lesson: id,
          },
        },
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

// TODO: handle errors
export const createLesson = createAsyncThunk(
  'api/lessons/create',
  async (
    {
      courseId,
      name,
      description,
      type,
      numberOfAnswers,
    }: {
      courseId: string;
      name: string;
      description: string;
      type: number;
      numberOfAnswers: number;
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post(
        '/lessons',
        {
          data: {
            id_course: courseId,
            name,
            description,
            type,
            number_of_answers: numberOfAnswers,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.lessons });
      })
      .addCase(fetchLessons.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchLessons.fulfilled,
        (state, { payload: { data, error } }) => {
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
      .addCase(fetchLessons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteLesson.fulfilled, (state, { payload }) => {
        state.data = state.data.filter(
          (course) => course.id !== payload.data.id
        );
      })
      .addCase(createLesson.fulfilled, (state, { payload }) => {
        state.data = [...state.data, payload.data];
      });
  },
});

export const selectLessonsData = (state: RootState) => state.lessons.data;
export const selectLessonsError = (state: RootState) => state.lessons.error;
export const selectLessonsStatus = (state: RootState) => state.lessons.status;

export default lessonsSlice.reducer;
